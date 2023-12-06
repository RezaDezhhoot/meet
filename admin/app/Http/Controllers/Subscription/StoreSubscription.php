<?php

namespace App\Http\Controllers\Subscription;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\BaseComponent;
use App\Models\Subscription;
use Illuminate\Validation\Rule;

class StoreSubscription extends BaseComponent
{
    public $title , $subscription , $amount , $validity , $description , $image , $status;

    public function mount($action , $id = null)
    {
        $this->authorizing('edit_subscriptions');
        $this->set_mode($action);
        if ($this->mode == self::UPDATE_MODE)
        {
            $this->header = 'اشتراک شماره '.$id;
            $this->subscription = Subscription::query()->findOrFail($id);
            $this->title = $this->subscription->title;
            $this->amount = $this->subscription->amount;
            $this->validity = $this->subscription->validity;
            $this->description = $this->subscription->description;
            $this->image = $this->subscription->image;
            $this->status = $this->subscription->status;
        } elseif ($this->mode == self::CREATE_MODE)
            $this->header = 'اشتراک جدید';
        else abort(404);
        $this->data['status'] = SubscriptionStatus::toArray();
    }

    public function store()
    {
        if ($this->mode == self::CREATE_MODE) {
            $this->saveInDataBase(new Subscription());
            $this->reset(['title','amount','validity','description','image','status']);
        } else {
            $this->saveInDataBase($this->subscription);
        }
    }

    private function saveInDataBase(Subscription $subscription)
    {
        $this->validate([
            'title' => ['required','string','max:250'],
            'amount' => ['required','numeric','between:0,99999999999.999'],
            'validity' => ['required','integer','between:1,3650'],
            'description' => ['nullable','string','max:34000'],
            'image' => ['nullable','string','max:2000'],
            'status' => ['required','string',Rule::in(SubscriptionStatus::cases())]
        ],[],[
            'title' => 'عنوان',
            'amount' => 'قیمت',
            'validity' => 'اعتبار',
            'description' => 'توضیخات',
            'image' => 'تضویر',
            'status' => 'وضعیت'
        ]);
        $subscription->title = $this->title;
        $subscription->amount = $this->amount;
        $subscription->validity = $this->validity;
        $subscription->description = $this->description;
        $subscription->image = $this->image;
        $subscription->status = $this->status;
        $subscription->save();
        $this->emitNotify('اطلاعات با موفقیت ثبت شد');
    }

    public function deleteItem()
    {
        $this->authorizing('delete_subscription');
        Subscription::destroy($this->subscription->id);
        return redirect()->route('admin.subscription.index');
    }

    public function render()
    {
        return view('admin.subscription.store-subscription')->extends('admin.layouts.admin');
    }
}
