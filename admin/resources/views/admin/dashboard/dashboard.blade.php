<div wire:poll.6s >
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
                                <span class="font-weight-bold text-dark font-size-lg">کاربران ثبت نام شده</span>
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
                                    جزئیات زنده اتاق ها
                                </h3>
                            </div>
                            <div class="panel-body">
                                @include('admin.layouts.advance-table')
                                <x-admin.loader />
                                <table class="table table-bordered">
                                    <thead class="thead-dark">
                                    <tr >
                                        <th>#</th>
                                        <th>عنوان اتاق</th>
                                        <th>ظرفیت اتاق</th>
                                        <th>وضعیت اتاق</th>
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
                                            <td>{{ $room->room->status->label() }}</td>
                                            <td>  {{ count($room->data) }} کاربر انلاین وجود دارد </td>
                                            <td>
                                                <ui>
                                                    <li class="border-bottom pb-1">نام :  <strong>{{ $room->room->host->name ?? '' }}</strong></li>
                                                    <li class="border-bottom  pb-1"> شماره همراه : <strong>{{ $room->room->host->phone ?? '' }}</strong></li>
                                                    <li> ایمیل :  <strong>{{ $room->room->host->email ?? '' }}</strong></li>
                                                </ui>
                                            </td>
                                            <td>
                                                <button data-toggle="collapse" data-target="#room{{$room->room_id}}"  class="btn btn-sm">
                                                    <i class="flaticon2-gear"></i><strong>مشاهده کاربران
                                                    </strong>
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
                                                        @forelse($room->data as $key => $user)
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
                                                        @empty
                                                            <td class="text-center" colspan="6">
                                                                <strong>هیچ کاربری در این اتاق انلاین نمی باشد</strong>
                                                            </td>
                                                        @endforelse
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforeach
                                    </tbody>
                                </table>
                            </div>
                            {{ sizeof($rooms) > 0 ? $rooms->links('admin.layouts.paginate') : ''}}
                        </div>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-md-12">
                        <div class="panel panel-default">
                            <div class="panel-body">
                                <div class="card card-custom gutter-b" wire:ignore.self>
                                    <div class="card-header">
                                        <div class="card-title">
                                            <div class="d-flex align-items-center">
                                                <h3 class="card-label">
                                                    نمودار جریان اتاق ها
                                                </h3>
                                            </div>
                                            <div>

                                            </div>
                                        </div>
                                    </div>
                                    <div class="card-body" wire:ignore>
                                        <!--begin::Chart-->
                                        <div  id="chart_3"></div>
                                        <!--end::Chart-->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endif
</div>
@push('scripts')
    <script>
        Livewire.on('chart' , function (data) {
            "use strict";
            // Shared Colors Definition
            const primary = '#6993FF';
            const success = '#1BC5BD';
            const warning = '#FFA800';
            // Class definition
            var KTApexChartsDemo = function () {
                // Private functions
                var _demo3 = function () {
                    const apexChart = "#chart_3";
                    var options = {
                        series: [{
                            name: 'تعداد کل کاربران انلاین',
                            data: data.total
                        }],
                        chart: {
                            type: 'bar',
                            height: 450
                        },
                        plotOptions: {
                            bar: {
                                horizontal: false,
                                columnWidth: '30%',
                                endingShape: 'rounded'
                            },
                        },
                        dataLabels: {
                            enabled: true
                        },
                        stroke: {
                            show: true,
                            width: 2,
                            colors: ['transparent']
                        },
                        xaxis: {
                            categories: data.x,
                        },
                        yaxis: {
                            title: {
                                text: 'کاربران'
                            }
                        },
                        fill: {
                            opacity: 1
                        },
                        tooltip: {
                            y: {
                                formatter: function (val) {
                                    return  val + " عدد "
                                }
                            }
                        },
                        colors: [primary, success, warning]
                    };

                    var chart = new ApexCharts(document.querySelector(apexChart), options);
                    chart.render();

                    Livewire.on('updateChart' , function (data){
                        chart.updateSeries([{
                            data: data.total,
                            xaxis: [],
                        }])
                        chart.updateOptions({
                            xaxis: {
                                categories: data.x,
                            },
                        })
                    });
                }
                return {
                    // public functions
                    init: function () {
                        _demo3();
                    }
                };
            }();

            jQuery(document).ready(function () {
                KTApexChartsDemo.init();
            });
        })
    </script>
@endpush
