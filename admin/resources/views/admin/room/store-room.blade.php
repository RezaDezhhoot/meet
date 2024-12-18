<div>
    @section('title','اتاق')
    <x-admin.form-control deleteAble="true" deleteContent="حذف اتاق" mode="{{$mode}}" title="اتاق"/>
    <div class="card card-custom gutter-b example example-compact">
        <div class="card-header">
            <h3 class="card-title">{{ $header }}</h3>
        </div>
        <x-admin.forms.validation-errors/>
        <div class="card-body">
            <div class="row">
                <x-admin.forms.input with="4" type="text" id="title" label="عنوان*" wire:model.defer="title"/>
                <x-admin.forms.input with="4" type="number" id="capacity" label="ظرفیت*" wire:model.defer="capacity"/>
                <x-admin.forms.dropdown with="4" id="status" :data="$data['status']" label="وضعیت*" wire:model="status"/>
                <x-admin.forms.lfm-standalone with="12" id="logo" label="لوگو سامانه*" :file="$logo" type="image" required="true" wire:model="logo"/>
                <x-admin.forms.dropdown  id="ui" :data="$data['ui']" label="ui*" wire:model.defer="ui"/>

                {{--                <x-admin.forms.searchable-dropdown help="{{$room->host->name ?? ''}}" wire:keydown="searchHost" with="6" id="host_id" :data="$data['users']" label="میزبان*" wire:model="host_id"/>--}}
                <x-admin.forms.select2 id="host_id" :data="$host"  width="6" label="میزبان*" ajaxUrl="/feed/users" wire:model.defer="host_id"/>
                <x-admin.forms.select2 id="owner_id" :data="$owner"  width="6" label="مالک*" ajaxUrl="/feed/users" wire:model.defer="owner_id"/>


            </div>
        </div>
    </div>
</div>
@push('scripts')
    <script>
        function deleteItem(id) {
            Swal.fire({
                title: 'حذف اتاق  !',
                text: 'آیا از حذف این اتاق اطمینان دارید؟',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'خیر',
                confirmButtonText: 'بله'
            }).then((result) => {
                if (result.value) {
                @this.call('deleteItem', id)
                }
            })
        }
    </script>
@endpush
