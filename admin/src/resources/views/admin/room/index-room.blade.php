<div>
    @section('title','اتاق ها ')
    <x-admin.form-control link="{{ route('admin.room.store',['create'] ) }}" title="اتاق ها"/>
    <div class="card card-custom">
        <div class="card-body">
            <div id="kt_datatable_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                @include('admin.layouts.advance-table')
                <div class="row">
                    <div class="col-sm-12 table-responsive">
                        <table class="table table-striped table-bordered" id="kt_datatable">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>عنوان</th>
                                <th>کلید اختصاصی</th>
                                <th>لینک اتاق</th>
                                <th>ظرفیت</th>
                                <th>وضعیت</th>
                                <th>عملیات</th>
                            </tr>
                            </thead>
                            <tbody>
                            @forelse($rooms as $item)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ $item->title }}</td>
                                    <td>{{ $item->key }}</td>
                                    <td>
                                        <a href="{{ $item->room_link }}">{{ $item->room_link }}</a>
                                    </td>
                                    <td>{{ $item->capacity }} نفر </td>
                                    <td>{{ $item->status_label }}</td>
                                    <td>
                                        <x-admin.edit-btn href="{{ route('admin.room.store',['edit', $item->id]) }}" />
                                        <x-admin.delete-btn onclick="deleteItem({{$item->_id}})" />
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
            {{$rooms->links('admin.layouts.paginate')}}
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
