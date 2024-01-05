<div>
    @section('title','کلید های دسترسی ')
    <x-admin.form-control link="{{ route('admin.token.store',['create'] ) }}" title="کلید های دسترسی"/>
    <div class="card card-custom">
        <div class="card-body">
            @include('admin.layouts.advance-table')
            <div class="row ">
                <div class="col-lg-12 table-responsive">
                    <table  class="table table-striped table-bordered" id="kt_datatable">
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>شماره شناسه</th>
                            <th>عنوان</th>
                            <th>شناسه کلید</th>
                            <th>تاریخ انقضا</th>
                            <th>اطلاعات کاربر</th>
                            <th>عملیات</th>
                        </tr>
                        </thead>
                        <tbody>
                        @forelse($items as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <td>{{ $item->id }}</td>
                                <td>{{ $item->name }}</td>
                                <td>{{ $item->value }}</td>
                                <td>{{ $item->expire ?? 'ندارد' }}</td>
                                <td>
                                    @if($item->user)
                                        <ul>
                                            <li>نام کاربر : {{ $item->user->name }}</li>
                                            <li>شماره همراه : {{ $item->user->phone }}</li>
                                            <li>ایمیل : {{ $item->user->email }}</li>
                                        </ul>
                                    @else
                                        کاربر مهمان
                                    @endif
                                </td>
                                <td>
                                    <x-admin.edit-btn href="{{ route('admin.token.store',['edit', $item->id]) }}" />
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
