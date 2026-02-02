import React, { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const Captcha = forwardRef(({ onChange }, ref) => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  return (
    <div className="flex justify-center my-4">
      <ReCAPTCHA
        ref={ref}
        sitekey={siteKey}
        onChange={onChange}
      />
    </div>
  );
});

export default Captcha;