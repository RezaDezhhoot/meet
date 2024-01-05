<?php

namespace App\Http\Controllers\AccessTokens;

use App\Http\Controllers\BaseComponent;
use Livewire\WithPagination;

class AccessToken extends BaseComponent
{
    use WithPagination;

    public $placeholder = 'عنوان کلید';

    public function mount()
    {
        $this->authorizing('show_tokens');
    }

    public function render()
    {
        $items = \App\Models\AccessToken::query()
            ->latest()->with('user')
            ->search($this->search)
            ->paginate($this->per_page);

        return view('admin.access-tokens.access-token' , get_defined_vars())->extends('admin.layouts.admin');
    }

    public function delete($id)
    {
        $this->authorizing('delete_tokens');
        \App\Models\AccessToken::destroy($id);
    }
}
