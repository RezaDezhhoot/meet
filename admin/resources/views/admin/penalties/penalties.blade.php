<div>
    @section('title','جریمه ها ')
    <x-admin.form-control   title="جریمه ها"/>
    <div class="card card-custom">
        <div class="card-body">
            <x-admin.forms.select2 id="room" :data="$room_detail" label="اتاق" ajaxUrl="/admin/feed/rooms" wire:model.defer="room"/>
            @include('admin.layouts.advance-table')
            <div class="row ">
                <div class="col-lg-12 table-responsive">
                    <table  class="table table-striped table-bordered" id="kt_datatable">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>IP کاربر</th>
                            <th>عنوان اتاق</th>
                            <th>اطلاعات کاربر</th>
                            <th>پایان جریمه</th>
                            <th>عملیات</th>
                        </tr>
                        </thead>
                        <tbody>
                        @forelse($items as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <th>{{ $item->user_ip }}</th>
                                <td>{{ $item->room->title }}</td>
                                <td>
                                    @if($item->user)
                                        <ul>
                                            <li>شماره همراه : {{ $item->user->phone }}</li>
                                            <li>ایمیل : {{ $item->user->email }}</li>
                                        </ul>
                                    @else
                                        کاربر مهمان
                                    @endif
                                </td>
                                <td>
                                    {{ $item->kicked_date }}
                                </td>
                                <td>
                                    <x-admin.delete-btn onclick="deleteItem('{{$item->id}}')" />
                                </td>
                            </tr>
                        @empty
                            <td class="text-center" colspan="11">
                                دیتایی جهت نمایش وجود ندارد
                            </td>
                        @endforelse
                        </tbody>
                    </table>
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
