//validation
var isvalidate = false;
function validateForm(formSelector) {
    isvalidate = false;
    $(".error-message").hide();
    $(formSelector+ " .validate").each(function () {
        if ($(this).val() == "") {
            isvalidate = true;
            $(this).next(".error-message").show();
        }
    });

}
var otp = '';
//login page events
function attachLoginPageEvents() {
    //submit login form
    $(".btn-login").off("click").on("click", function () { 
        validateForm(".login-form");
        if (isvalidate) return;
       //otp
        otp = generateSixDigitNumber();
        alert("Your OTP is: " + otp);
        sessionStorage.setItem("otp", otp);
        location.href = "otpverification.html";
    });
}

// Generate random 6-digit number
function generateSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

/****************************OTP verification***********************************/
function attachOtpPageEvents() {
    otp = sessionStorage.getItem('otp') || '';
    const $inputs = $('.otp-inputs input');
    const $verifyBtn = $('#verify');
    const $message = $('#message');
    const $resendBtn = $('#resend-btn');

    $inputs.first().focus();
    $inputs.on('input', function () {
        let v = $(this).val().replace(/[^0-9]/g, '');
        $(this).val(v);
        if (v && $(this).next('input').length) {
            $(this).next('input').focus();
        }
        updateVerify();
    });

    $inputs.on('keydown', function (e) {
        if (e.key === 'Backspace' && !$(this).val() && $(this).prev('input').length) {
            $(this).prev('input').focus();
        }
        if (e.key === 'ArrowLeft' && $(this).prev('input').length) {
            $(this).prev('input').focus();
        }
        if (e.key === 'ArrowRight' && $(this).next('input').length) {
            $(this).next('input').focus();
        }
    });

    $inputs.on('paste', function (e) {
        e.preventDefault();
        const paste = (e.originalEvent.clipboardData || window.clipboardData).getData('text').trim();
        const digits = paste.replace(/\D/g, '').slice(0, $inputs.length).split('');
        if (digits.length) {
            $inputs.each((i, el) => $(el).val(digits[i] || ''));
            const next = digits.length < $inputs.length ? digits.length : $inputs.length - 1;
            $inputs.eq(next).focus();
            updateVerify();
        }
    });

    $('#otp-form').on('submit', function (e) {
        e.preventDefault();
        $verifyBtn.prop('disabled', true);
        $message.removeClass().text('Verifying...');
        const code = $inputs.map((i, el) => $(el).val()).get().join('');
        
        setTimeout(() => {
            if (code == otp) {
                $message.addClass('success').text('Success — your number is verified.');
                location.href = "dashboard.html";
            } else {
                $message.addClass('error').text('Invalid code. Please try again.');
                $inputs.first().focus();
            }
            updateVerify();
        }, 850);
    });

    let resendSeconds = 30;
    const interval = setInterval(() => {
        if (resendSeconds <= 0) {
            $resendBtn.prop('disabled', false).removeAttr('aria-disabled').text('Resend');
            clearInterval(interval);
        } else {
            $resendBtn.text(resendSeconds + 's');
            resendSeconds--;
        }
    }, 1000);

    $resendBtn.on('click', function () {
        $inputs.val('');
        otp = generateSixDigitNumber();
        alert("Your OTP is: " + otp);
        $(this).prop('disabled', true).attr('aria-disabled', 'true');
        $message.removeClass().text('A new code has been sent.');
        resendSeconds = 30;
        $(this).text(resendSeconds + 's');
        updateVerify();
        const t = setInterval(() => {
            if (resendSeconds <= 0) {
                $resendBtn.prop('disabled', false).text('Resend');
                clearInterval(t);
            } else {
                resendSeconds--;
                $resendBtn.text(resendSeconds + 's');
            }
        }, 1000);
    });

    $('#use-other').on('click', function () {
        $message.removeClass().addClass('help').text('We sent an email link instead. Check your inbox.');
    });
}

function updateVerify() {
    const $inputs = $('.otp-inputs input');
    const $verifyBtn = $('#verify');
    const filled = $inputs.toArray().every(i => $(i).val().trim().length === 1);
    $verifyBtn.prop('disabled', !filled);
}