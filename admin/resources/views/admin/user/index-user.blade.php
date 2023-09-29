<div>
    @section('title','کاربر ')
    <x-admin.form-control link="{{ route('admin.user.store',['create'] ) }}" title="کاربر"/>
    <div class="card card-custom">
        <div class="card-body">
            <div class="row">
                <x-admin.forms.dropdown with="6" id="roles" :data="$data['roles']" label="نقش" wire:model="roles"/>
                <x-admin.forms.dropdown with="6" id="status" :data="$data['status']" label="وضعیت" wire:model="status"/>
            </div>
            <div id="kt_datatable_wrapper" class="dataTables_wrapper dt-bootstrap4 no-footer">
                @include('admin.layouts.advance-table')
                <div class="row">
                    <div class="col-sm-12 table-responsive">
                        <table class="table table-striped table-bordered" id="kt_datatable">
                            <thead>
                            <tr>
                                <th>#</th>
                                <th> نام</th>
                                <th>ایمیل</th>
                                <th>شماره همراه</th>
                                <th>وضعیت</th>
                                <th>عملیات</th>
                            </tr>
                            </thead>
                            <tbody>
                            @forelse($users as $item)
                                <tr>
                                    <td>{{ $loop->iteration }}</td>
                                    <td>{{ $item->name }}</td>
                                    <td>{{ $item->email }}</td>
                                    <td>{{ $item->phone }}</td>
                                    <td>{{ $item->status_label }}</td>
                                    <td>
                                        <x-admin.edit-btn href="{{ route('admin.user.store',['edit', $item->id]) }}" />
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
            {{$users->links('admin.layouts.paginate')}}
        </div>
    </div>
</div>
