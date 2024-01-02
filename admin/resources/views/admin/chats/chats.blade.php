<div>
    @section('title','چت ها ')
    <x-admin.form-control   title="چت ها"/>
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
                            <th>شماره شناسه</th>
                            <th>عنواتاق</th>
                            <th>نام کاربر</th>
                            <th>IP کاربر</th>
                            <th>متن چت</th>
                            <th>اطلاعات کاربر</th>
                            <th>عملیات</th>
                        </tr>
                        </thead>
                        <tbody>
                        @forelse($items as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td>{{ $item->id }}</td>
                                <td>{{ $item->room->title }}</td>
                                <td>{{ $item->sender }}</td>
                                <td>{{ $item->user_ip }}</td>
                                <td>{!! $item->text !!}</td>
                                <td>
                                    @if($item->user)
                                        <ul>
                                            <li>شماره همراه : {{ $item->user->phone }}</li>
                                            <li>ایمیل : {{ $item->user->email }}</li>
                                        </ul>
                                    @endif
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
