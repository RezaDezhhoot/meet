<div>
    @section('title','فعالیت کاربران')
    <x-admin.form-control   title="فعالیت کاربران"/>
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
                            <th>رویداد</th>
                            <th>IP کاربر</th>
                            <th>عنوان اتاق</th>
                            <th>اطلاعات کاربر</th>
                            <th>تاریخ </th>
                        </tr>
                        </thead>
                        <tbody>
                        @forelse($items as $item)
                            <tr>
                                <td>{{ $loop->iteration }}</td>
                                <th>{{ $item->action }}</th>
                                <th>{{ $item->user_ip }}</th>
                                <td>{{ $item->room->title }}</td>
                                <td>
                                    @if($item->user)
                                        <ul>
                                            <li>نام : {{ $item->user->name }}</li>
                                            <li>شماره همراه : {{ $item->user->phone }}</li>
                                            <li>ایمیل : {{ $item->user->email }}</li>
                                        </ul>
                                    @else
                                        کاربر مهمان
                                    @endif
                                </td>
                                <td>
                                    {{ $item->created_at }}
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
