<?php

namespace App\Http\Controllers\AccessTokens;

use App\Http\Controllers\BaseComponent;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;

class StoreAccessToken extends BaseComponent
{
    public $header , $token , $title , $expire_at , $user_id;

    public function mount($action , $id = null)
    {
        $this->authorizing('edit_tokens');
        self::set_mode($action);
        if ($this->mode == self::UPDATE_MODE) {
            $this->token = \App\Models\AccessToken::query()->with('user',function ($q){
                return $q->concat();
            })->findOrFail($id);

            $this->title = $this->token->name;
            $this->expire_at = $this->dateConverter($this->token->expire_at);
            $this->user_id = $this->token->user_id;
            $this->header = $this->title;
        } elseif ($this->mode == self::CREATE_MODE) {
            $this->header = 'دسترسی جدید';
        }
    }

    public function store()
    {

        $this->authorizing('edit_tokens');
        if ($this->mode == self::CREATE_MODE) {
            $this->saveInDB(new \App\Models\AccessToken());
            $this->resetData();
        } elseif ($this->mode == self::UPDATE_MODE) {
            $this->saveInDB($this->token);
        }
    }

    public function resetData()
    {
        $this->reset(['title','user_id','expire_at']);
    }

    private function saveInDB(\App\Models\AccessToken $token) {
        $this->expire_at = $this->dateConverter($this->expire_at,'m') ;
        $this->validate([
            'title' => ['required','string','max:150'],
            'user_id' => ['required','exists:users,id'],
            'expire_at' => ['nullable','date']
        ],[],[
            'title' => 'عنوان',
            'user_id' => 'کاربر',
            'expire_at' => 'تاریخ انقضا'
        ]);
        $token->name = $this->title;
        $token->user_id = $this->user_id;
        $token->expire_at = $this->expire_at;
        $token->save();
        $this->expire_at = $this->dateConverter($token->expire_at);
        $this->emitNotify('اطلاعات با موفقیت دخیره شد');
    }

    public function deleteItem()
    {
        $this->authorizing('delete_tokens');
        $this->token->delete();
        return redirect()->route('admin.token.index');
    }

    public function render()
    {
        return view('admin.access-tokens.store-access-token')->extends('admin.layouts.admin');
    }
}
