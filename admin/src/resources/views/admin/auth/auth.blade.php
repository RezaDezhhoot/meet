<form class="form" wire:submit.prevent="login" method="post" id="kt_login_signin_form">
    <div class="form-group mb-5">
        @csrf
        <input wire:model.defer="email" style="text-align: right" class="form-control h-auto form-control-solid py-4 px-8" type="text" placeholder="ادرس ایمیل" name="username" autocomplete="off" />
        @error('email')
        <span class="text-danger">
                            {{ $message }}
                        </span>
        @enderror
    </div>
    <div class="form-group mb-5">
        <input wire:model.defer="password" style="text-align: right" class="form-control h-auto form-control-solid py-4 px-8" type="password" placeholder="پسورد" name="password" />
        @error('password')
        <span class="text-danger">
                            {{ $message }}
                        </span>
        @enderror
    </div>
    <button type="submit" id="kt_login_signin_submit" class="btn btn-primary font-weight-bold px-9 py-4 my-3 mx-4">ورود</button>
</form>
