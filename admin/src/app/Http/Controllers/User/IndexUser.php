<?php

namespace App\Http\Controllers\User;

use App\Enums\UserStatus;
use App\Http\Controllers\BaseComponent;
use App\Models\Role;
use App\Models\User;
use Livewire\WithPagination;

class IndexUser extends BaseComponent
{
    use WithPagination ;
    public $roles , $status , $placeholder = 'نام  یا شماره همراه';
    protected $queryString = ['roles' ,'status'];

    public function mount()
    {
        $this->authorizing('show_users');
        $this->data['roles'] = Role::all()->pluck('name','name');
        $this->data['status'] = UserStatus::toArray();
    }

    public function render()
    {
        $users = User::query()->latest()
            ->when($this->roles,function ($q) {
                return $q->role($this->roles);
            })
            ->when($this->status,function ($q) {
                return $q->where('status',$this->status);
            })
            ->search($this->search)
            ->paginate($this->per_page);

        return view('admin.user.index-user',get_defined_vars())->extends('admin.layouts.admin');
    }
}
