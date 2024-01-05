@props(['id', 'label','data','width' => 12, 'value' => false ,'ajaxUrl' => ''])
<div class="form-group my-0 p-0 col-12 col-md-{{$width}}" wire:ignore>
        <label for="{{$id}}"> {{$label}} </label>
    <div class=" d-flex align-items-center">
        <select id="{{$id}}" {{ $attributes->wire('model') }}
        class="form-control select2" {!! $attributes->merge(['class'=> 'form-control']) !!}>
            @if($data && sizeof($data) > 0)
                <option selected value="{{ $data['id'] }}">{{$data['text'] ?? '' }}</option>
            @endif
        </select>
        <button class="btn btn-sm" id="clear{{$id}}"><i class="flaticon2-delete text-danger fa-lg"></i></button>
    </div>
</div>
@push('scripts')
    <script>
        $(document).ready(() => {
            $('#{{$id}}').select2({
                placeholder: "انتخاب",
                allowClear: false,
                ajax:{
                    url:  '{{$ajaxUrl}}',
                    data: function (params) {
                        var query = {
                            search: params.term,
                            type: 'public'
                        }

                        // Query parameters will be ?search=[term]&type=public
                        return query;
                    },
                    processResults: function (data) {
                        return {
                            results: data
                        };
                    }
                }
            })
            $('#{{$id}}').on('change', function (e) {
                var data = $('#{{$id}}').select2("val");
            @this.set('{{$attributes->wire("model")->value}}', data);
            });
            $('#clear{{$id}}').on('click', function (e) {
                $('#{{$id}}').empty();
                @this.set('{{$attributes->wire("model")->value}}', null);
            });
        })
    </script>
@endpush
