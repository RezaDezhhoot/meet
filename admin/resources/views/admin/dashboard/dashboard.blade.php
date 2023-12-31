<div wire:poll.5s="updateList">
    @section('title','داشبورد')
    @if(auth()->user()->hasPermissionTo('show_dashboard'))
        <div class="subheader py-2 py-lg-6 subheader-solid" id="kt_subheader">
            <div class="container-fluid d-flex align-items-center justify-content-between flex-wrap flex-sm-nowrap">
                <!--begin::Info-->
                <div class="d-flex align-items-center flex-wrap mr-1">
                    <!--begin::Page Heading-->
                    <div class="d-flex align-items-baseline flex-wrap mr-5">
                        <!--begin::Page Title-->
                        <h5 class="text-dark font-weight-bold my-1 mr-5">داشبورد</h5>
                        <!--end::Page Title-->
                    </div>
                    <!--end::Page Heading-->
                </div>
                <!--end::Info-->
                <!--begin::Toolbar-->
                <!--end::Toolbar-->
            </div>
        </div>
        <div class="card card-custom">
            <div class="card-body">
                <div class="d-flex align-items-center flex-wrap mr-1">
                    <!--begin::Page Heading-->
                    <div class="d-flex align-items-baseline flex-wrap mr-5">
                        <!--begin::Page Title-->
                        <h3 class="pb-3">
                            گزارش کلی
                        </h3>
                        <!--end::Page Title-->
                    </div>
                    <!--end::Page Heading-->
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <!--begin::Stats Widget 25-->
                        <div class="card card-custom bg-light-primary card-stretch gutter-b">
                            <!--begin::Body-->
                            <div class="card-body">
                            <span class="svg-icon svg-icon-info svg-icon-4x">
                                <i class="text-info flaticon2-group fa-3x"></i>
                            </span>
                                <span class="card-title font-weight-bolder text-dark-75 font-size-h2 mb-0 mt-6 d-block">
                                {{ $rooms_count }}عدد
                            </span>
                                <span class="font-weight-bold text-dark font-size-lg">اتاق ها</span>
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Stats Widget 25-->
                    </div>
                    <div class="col-md-6">
                        <!--begin::Stats Widget 25-->
                        <div class="card card-custom bg-light-primary card-stretch gutter-b">
                            <!--begin::Body-->
                            <div class="card-body">
                            <span class="svg-icon svg-icon-info svg-icon-4x">
                                <i class="text-info flaticon2-user fa-3x"></i>
                            </span>
                                <span class="card-title font-weight-bolder text-dark-75 font-size-h2 mb-0 mt-6 d-block">
                                {{ $users_count }}عدد
                            </span>
                                <span class="font-weight-bold text-dark font-size-lg">کاربران</span>
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Stats Widget 25-->
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-md-12">
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <h3 class="pb-3">
                                    جزئیات اتاق ها
                                </h3>
                            </div>
                            <div class="panel-body">
                                @include('admin.layouts.advance-table')
                                <table class="table table-bordered">
                                    <thead class="thead-dark">
                                    <tr >
                                        <th>#</th>
                                        <th>عنوان اتاق</th>
                                        <th>ظرفیت اتاق</th>
                                        <th> تعداد کاربران آنلاین</th>
                                        <th>مشخصات میزبان</th>
                                        <th class="d-flex align-items-center"><i class="flaticon2-gear px-2"></i> <span>جزئیات</span> </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    @foreach($rooms as $room)
                                        <tr class="accordion-toggle table-primary">
                                            <td>{{ $loop->iteration }}</td>
                                            <td>{{ $room->room->title }}</td>
                                            <td>{{ $room->room->capacity }} نفر </td>
                                            <td>  {{ count($room->data) }} کاربر انلاین وجود دارد </td>
                                            <td>
                                                <ui>
                                                    <li>نام :  <strong>{{ $room->room->host->name ?? '' }}</strong></li>
                                                    <li> شماره همراه : <strong>{{ $room->room->host->phone ?? '' }}</strong></li>
                                                    <li> ایمیل :  <strong>{{ $room->room->host->email ?? '' }}</strong></li>
                                                </ui>
                                            </td>
                                            <td>
                                                <button data-toggle="collapse" data-target="#room{{$room->room_id}}"  class="btn btn-sm">
                                                    <i class="flaticon2-gear"></i><strong>مشاهده کاربران</strong>
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colspan="12" class="hiddenRow">
                                                <div wire:ignore.self class="accordian-body collapse" id="room{{$room->room_id}}">
                                                    <h5>
                                                        <strong>کاربران آنلاین</strong>
                                                    </h5>
                                                    <table class="table table-warning table-bordered table-striped">
                                                        <thead class="thead-dark">
                                                        <tr>
                                                            <th>#</th>
                                                            <th>نام کاربر</th>
                                                            <th>نقش کاربر</th>
                                                            <th>IP کاربر</th>
                                                            <th>ورود به صورت</th>
                                                            <th>شناسه موقت کاربر</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        @foreach($room->data as $key => $user)
                                                            <tr>
                                                                <td>{{ $loop->iteration  }}</td>
                                                                <td class="d-flex align-items-center">
                                                                    <i class="flaticon2-user px-2 {{ $user['media']['host'] ? 'text-primary' : 'text-success' }}"></i>
                                                                    <span>
                                                                      {{ $user['name'] }}
                                                                    </span>
                                                                </td>
                                                                <td>{{ $user['media']['host'] ? 'میزبان' : 'کاربر' }}</td>
                                                                <td>{{ $user['ip'] }}</td>
                                                                <td>{{ $user['user']['type'] }}</td>
                                                                <td>{{ $key }}</td>
                                                            </tr>
                                                        @endforeach
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                    </tbody>
                                </table>
                            </div>
                            {{$rooms->links('admin.layouts.paginate')}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif
</div>
