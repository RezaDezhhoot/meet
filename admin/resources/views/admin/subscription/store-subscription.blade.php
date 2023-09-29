<div>
    @section('title','اشتراک')
    <x-admin.form-control deleteAble="true" deleteContent="حذف اشتراک" mode="{{$mode}}" title="اشتراک"/>
    <div class="card card-custom gutter-b example example-compact">
        <div class="card-header">
            <h3 class="card-title">{{ $header }}</h3>
        </div>
        <x-admin.forms.validation-errors/>
        <div class="card-body">
           <div class="row">
               <x-admin.forms.input with="6" type="text" id="title" label="عنوان*" wire:model.defer="title"/>
               <x-admin.forms.input with="6" type="number" id="amount" label="قیمت*" wire:model.defer="amount"/>
               <x-admin.forms.input with="6" type="number" help="بر حسب روز" id="validity" label="اعتبار*" wire:model.defer="validity"/>
               <x-admin.forms.dropdown with="6" id="status" :data="$data['status']" label="وضعیت*" wire:model="status"/>
               <x-admin.forms.lfm-standalone id="image" label="تصویر" :file="$image" type="image" required="true" wire:model="image"/>
               <x-admin.forms.full-text-editor id="description" label="توضیخات" wire:model.defer="description"/>
           </div>
        </div>
    </div>
</div>
@push('scripts')
    <script>
        function deleteItem(id) {
            Swal.fire({
                title: 'حذف اشتراک  !',
                text: 'آیا از حذف این اشتراک اطمینان دارید؟',
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
