<div>
    @section('title','اشتراک ها ')
    <x-admin.form-control link="{{ route('admin.subscription.store',['create'] ) }}" title="اشتراک"/>
    <div class="card card-custom">
        <div class="card-body">
            <div class="row">
                <x-admin.forms.dropdown  id="status" :data="$data['status']" label="وضعیت" wire:model="status"/>
            </div>
            <div id="kt_datatable_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                @include('admin.layouts.advance-table')
                <div class="row">
                    <div class="col-sm-12 table-responsive">
                        <table class="table table-striped table-bordered" id="kt_datatable">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>عنوان</th>
                                <th>قیمت</th>
                                <th>اعتبار(روز)</th>
                                <th>وضعیت</th>
                                <th>عملیات</th>
                            </tr>
                            </thead>
                            <tbody>
                            @forelse($items as $item)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ $item->title }}</td>
                                    <td>{{ number_format($item->amount) }}</td>
                                    <td>{{ $item->validity }}</td>
                                    <td>{{ $item->status_label }}</td>
                                    <td>
                                        <x-admin.edit-btn href="{{ route('admin.subscription.store',['edit', $item->id]) }}" />
                                        <x-admin.delete-btn onclick="deleteItem({{$item->id}})" />
                                    </td>
                                </tr>
                            @empty
                                <td class="text-center" colspan="10">
                                    دیتایی جهت نمایش وجود ندارد
                                </td>
                            @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {{$items->links('admin.layouts.paginate')}}
        </div>
    </div>
</div>
@push('scripts')
    <script>
        function deleteItem(id) {
            Swal.fire({
                title: 'حذف !',
                text: 'آیا از حذف این مورد اطمینان دارید؟',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                cancelButtonText: 'خیر',
                confirmButtonText: 'بله'
            }).then((result) => {
                if (result.value) {
                @this.call('delete', id)
                }
            })
        }
    </script>
@endpush
