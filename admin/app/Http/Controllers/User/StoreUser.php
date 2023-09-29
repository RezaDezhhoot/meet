<?php

namespace App\Http\Controllers\User;

use App\Enums\UserStatus;
use App\Http\Controllers\BaseComponent;
use App\Models\Role;
use App\Models\User;
use Illuminate\Validation\Rule;

class StoreUser extends BaseComponent
{
    public $user , $name , $phone , $email , $password , $userRole = [] , $status;

    public function mount($action , $id = null)
    {
        $this->authorizing('edit_users');
        $this->set_mode($action);
        if ($this->mode == self::UPDATE_MODE)
        {
            $this->header = 'کاربر شماره '.$id;
            $this->user = User::query()->findOrFail($id);
            $this->name = $this->user->name;
            $this->phone = $this->user->phone;
            $this->email = $this->user->email;
            $this->status = $this->user->status->value;
            $this->userRole = $this->user->roles()->pluck('name','id')->toArray();
        } elseif ($this->mode == self::CREATE_MODE)
            $this->header = 'کاربر جدید';
        else abort(404);

        $this->data['roles'] = Role::all();
        $this->data['status'] = UserStatus::toArray();
    }

    public function store()
    {
        $this->authorizing('edit_users');
        if ($this->mode == self::UPDATE_MODE)
            $this->saveInDataBase($this->user);
        else {
            $this->saveInDataBase(new User());
            $this->reset(['name','phone','email','password','status']);
        }
    }

    private function saveInDataBase(User $model)
    {
        $fields = [
            'name' => ['required', 'string','max:65'],
            'phone' => ['required', 'size:11' , 'unique:users,phone,'. ($this->user->id ?? 0)],
            'email' => ['nullable','email','max:200','unique:users,email,'. ($this->user->id ?? 0)],
            'status' => ['required','string',Rule::in(UserStatus::cases())]
        ];
        $messages = [
            'name' => 'نام ',
            'phone' => 'شماره همراه',
            'email' => 'ایمیل',
            'status' => 'وضعیت'
        ];

        if ($this->mode == self::CREATE_MODE || !empty($this->password))
        {
            $fields['password'] = ['required','min:6','regex:/^.*(?=.*[a-zA-Z])(?=.*[0-9]).*$/'];
            $messages['password'] = 'گذرواژه';
        }
        $this->validate($fields,[],$messages);
        $model->name = $this->name;
        $model->phone = $this->phone;
        $model->email = $this->email;
        $model->status = $this->status;

        if (UserStatus::tryFrom($this->status) === UserStatus::VERIFIED) {
            $model->verified_at = now();
        } else {
            $model->verified_at = null;
        }

        $model->save();
        if ($this->mode == self::CREATE_MODE || !empty($this->password))
            $model->password = $this->password;

        if ((auth()->user()->hasRole('super_admin') && !$model->hasRole('administrator')) || auth()->user()->hasRole('administrator'))
        {
            $model->syncRoles($this->userRole);
        }
        $this->emitNotify('اطلاعات با موفقیت ثبت شد');
    }

    public function render()
    {
        return view('admin.user.store-user')->extends('admin.layouts.admin');
    }
}
