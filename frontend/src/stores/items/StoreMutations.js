export const setGoogleRecaptcha = (state) => {
  setTimeout(()=> {
    const script = document.createElement('script');

    script.setAttribute('src', 'https://www.google.com/recaptcha/api.js');

    const start = document.createElement('script');

    // start.text = `var instance = new ExampleObj.start({ container: 'element-id' });`;

    document.body.appendChild(script);
    document.body.appendChild(start);

    $(function(){
      function rescaleCaptcha(){
        let width = $('.g-recaptcha').parent().width();
        let scale;
        if (width < 302) {
          scale = width / 302;
        } else{
          scale = 1.0;
        }

        $('.g-recaptcha').css('transform', 'scale(' + scale + ')');
        $('.g-recaptcha').css('-webkit-transform', 'scale(' + scale + ')');
        $('.g-recaptcha').css('transform-origin', '100% 0');
        $('.g-recaptcha').css('-webkit-transform-origin', '100% 0');
      }

      rescaleCaptcha();
      $( window ).resize(function() { rescaleCaptcha(); });

    });

  },0);
}