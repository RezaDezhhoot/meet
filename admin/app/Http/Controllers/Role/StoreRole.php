<?php

namespace App\Http\Controllers\Role;

use App\Http\Controllers\BaseComponent;
use App\Models\Permission;
use App\Models\Role;

class StoreRole extends BaseComponent
{
    public object $role ;
    public $permission , $name  , $header  , $permissionSelected = [];

    public function mount($action , $id = null)
    {
        $this->authorizing('edit_roles');
        $this->set_mode($action);
        if ($this->mode == self::UPDATE_MODE)
        {
            $this->role = Role::query()->whereNotIn('name', ['administrator', 'admin','super_admin'])->findOrFail($id);
            $this->header = $this->role->name;
            $this->name = $this->role->name;
            $this->permissionSelected = $this->role->permissions()->pluck('name')->toArray();
        } elseif ($this->mode == self::CREATE_MODE) $this->header = 'نقش جدید';
        else abort(404);
        $this->permission = Permission::all();
    }


    public function store()
    {
        if ($this->mode == self::UPDATE_MODE)
            $this->saveInDateBase($this->role);
        elseif ($this->mode == self::CREATE_MODE) {
            $this->saveInDateBase(new Role());
            $this->reset(['name','permissionSelected']);
        }
    }

    public function saveInDateBase(Role $model)
    {
        $this->validate(
            [
                'name' => ['required', 'string','max:250'],
                'permissionSelected' => ['required', 'array'],
                'permissionSelected.*' => ['required', 'exists:permissions,name'],
            ] , [] , [
                'name' => 'عنوان',
                'permissionSelected' => 'دسترسی ها',
                'permissionSelected.*' => 'دسترسی ها',
            ]
        );
        $model->name = $this->name;
        $model->save();
        $model->syncPermissions($this->permissionSelected);
        $this->emitNotify('اطلاعات با موفقیت ثبت شد');
    }

    public function deleteItem()
    {
        $this->authorizing('delete_roles');
        $role = Role::query()->whereNotIn('name', ['administrator', 'super_admin', 'admin'] , $this->role->id);
        if (!is_null($role))
        {
            $role->delete($role);
            return redirect()->route('admin.role.index');
        } else
            return $this->emitNotify('امکان خذف برای این نقش وجود ندارد','warning');
    }


    public function render()
    {
        return view('admin.role.store-role')->extends('admin.layouts.admin');
    }
}
