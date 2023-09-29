<div>
    @section('title','تنظیمات پایه')
    <x-admin.form-control title="تنطیمات "/>
    <div class="card card-custom gutter-b example example-compact">
        <div class="card-header">
            <h3 class="card-title">{{ $header }}</h3>
        </div>
        <x-admin.forms.validation-errors/>
        <div class="card-body">
            <div class="row">
                <x-admin.forms.input type="text" id="title" label="عنوان سامانه*" wire:model.defer="title"/>
                <x-admin.forms.input type="text" id="room_domain" label="دامنه اتاق ها*" wire:model.defer="room_domain"/>
                <x-admin.forms.lfm-standalone id="logo" label="لوگو سامانه*" :file="$logo" type="image" required="true" wire:model="logo"/>
            </div>
        </div>
    </div>
</div>
