<div xmlns:wire="http://www.w3.org/1999/xhtml">
    @section('title','کاربر ')
    <x-admin.form-control mode="{{$mode}}" title="کاربر"/>
    <div class="card card-custom gutter-b example example-compact">
        <div class="card-header">
            <h3 class="card-title">{{ $header }}</h3>
        </div>
        <x-admin.forms.validation-errors/>
        <div class="card-body">
            <div class="row">
                <x-admin.forms.input with="6" type="text" id="first_name" label="نام*" wire:model.defer="name"/>
                <x-admin.forms.input with="6" type="text" id="phone" label="شماره همراه*" wire:model.defer="phone"/>
                <x-admin.forms.input with="6" type="email" id="email" label="ایمیل" wire:model.defer="email"/>
                <x-admin.forms.input type="password" id="password" label="گذرواژه" wire:model.defer="password"/>
                <x-admin.forms.dropdown id="status" :data="$data['status']" label="وضعیت*" wire:model="status"/>
            </div>
            <hr>
            <x-admin.form-section label="نقش">
                <div class="row">
                    @foreach($data['roles'] as  $value)
                        <div class="col-2">
                            <x-admin.forms.checkbox label="{{$value['name']}}" id="permissions-{{$value['id']}}" value="{{$value['name']}}" wire:model.defer="roles" wire:model.defer="userRole.{{$value['id']}}" />
                        </div>
                    @endforeach
                </div>
            </x-admin.form-section>
        </div>
    </div>
</div>

