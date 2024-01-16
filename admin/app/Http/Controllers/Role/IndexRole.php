<?php

namespace App\Http\Controllers\Role;

use App\Http\Controllers\BaseComponent;
use App\Models\Role;
use Livewire\WithPagination;

class IndexRole extends BaseComponent
{
    use WithPagination ;
    public ?string $placeholder = 'عنوان';

    public function mount()
    {
        $this->authorizing('show_roles');
    }

    public function render()
    {
        $roles = Role::query()
            ->whereNotIn('name', ['administrator', 'admin','super_admin'])
            ->latest('id')->search($this->search)->paginate($this->per_page);
        return view('admin.role.index-role',get_defined_vars())->extends('admin.layouts.admin');
    }
}
