<div>
    @section('title','کلید های دسترسی ')
    <x-admin.form-control deleteAble="true" deleteContent="حذف کلید دسترسی " mode="{{$mode}}" title="کلید های دسترسی "/>
    <div class="card card-custom gutter-b example example-compact">
        <div class="card-header">
            <h3 class="card-title">{{ $header }}</h3>
        </div>
        <x-admin.forms.validation-errors/>
        <div class="card-body">
            <div class="row">
                <x-admin.forms.input with="4" type="text" id="title" label="عنوان*" wire:model.defer="title"/>
                <x-admin.forms.select2 id="user_id" :data="$token ? $token->user->toArray() : []"  width="4" label="کاربر*" ajaxUrl="/admin/feed/users" wire:model.defer="user_id"/>
                <x-admin.forms.jdate-picker with="4" id="expire_at" label="تاریخ انقضا" wire:model.defer="expire_at"/>
            </div>
        </div>
    </div>
</div>
@push('scripts')
    <script>
        function deleteItem(id) {
            Swal.fire({
                title: 'حذف کلید !',
                text: 'آیا از حذف این کلید اطمینان دارید؟',
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
