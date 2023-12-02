<?php

namespace App\Http\Controllers\Subscription;

use App\Enums\SubscriptionStatus;
use App\Http\Controllers\BaseComponent;
use App\Models\Subscription;
use Livewire\WithPagination;

class IndexSubscription extends BaseComponent
{
    use WithPagination;

    public $status , $placeholder = ' عنوان';

    protected $queryString = ['status'];

    public function mount()
    {
        $this->authorizing('show_subscriptions');
        $this->data['status'] = SubscriptionStatus::toArray();
    }

    public function render()
    {
        $items = Subscription::query()->latest()
            ->when($this->status,function ($q) {
                return $q->where('status',$this->status);
            })->search($this->search)
            ->paginate($this->per_page);

        return view('admin.subscription.index-subscription',get_defined_vars())->extends('admin.layouts.admin');
    }

    public function delete($id)
    {
        $this->authorizing('delete_subscriptions');
        Subscription::destroy($id);
    }
}
