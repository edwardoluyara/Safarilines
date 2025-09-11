import { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; 
import styles from './RegisterForm.module.css';

const RegisterForm = ({ switchToLogin }) => {
  const [formData, setFormData] = useState({
    role: 'customer',
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone: '',
    security_question: 'mother_maiden_name',
    security_answer: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    post_code: '',
    country: 'Nigeria',
    recaptcha_token: '',

    // Service provider specific
    company_name: '',
    service_type: '',
    license_documents: null,
  });

  const recaptchaRef = useRef();
  const navigate = useNavigate();
  const { register, errors, isLoading } = useAuth();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'license_documents') {
    setFormData({ ...formData, [name]: Array.from(files) }); // store multiple files as array
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const onReCAPTCHAChange = (token) => {
    setFormData({ ...formData, recaptcha_token: token });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.recaptcha_token) {
      toast.error('Please complete the reCAPTCHA verification');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      // Build FormData
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'license_documents') {
          if (formData.role === 'service_provider' && Array.isArray(value)) {
            value.forEach((file) => {
              payload.append('license_documents', file);
            });
          }
          // Skip license_documents entirely if not a service provider
        } else {
          payload.append(key, value);
        }
      });

      // Submit to backend (register must support FormData)
      const response = await register(payload);

      console.log("Registration response:", response);

      if (response?.email) {
        navigate('/verify-email', {
          state: {
            email: response.email,
            canResend: true
          }
        });
      } else if (response?.tokens) {
        localStorage.setItem('accessToken', response.tokens.access);
        localStorage.setItem('refreshToken', response.tokens.refresh);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };
  return (
    <form onSubmit={handleSubmit} className={styles.authForm}>
      <h3 className={styles.title}>User Registration</h3>
      
      {/* Role Selection */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Role</h4>
        <div className={styles.formGroup}>
          <select 
            name="role" 
            value={formData.role} 
            onChange={handleChange}
            className={styles.formInput}
          >
            <option value="customer">Customer</option>
            <option value="service_provider">Service Provider</option>
          </select>
        </div>
      </div>

      {/* Personal Information */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Personal Information</h4>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="first_name"
              placeholder="First name"
              value={formData.first_name}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
            {errors.first_name && <span className={styles.error}>{errors.first_name}</span>}
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="last_name"
              placeholder="Last name"
              value={formData.last_name}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
            {errors.last_name && <span className={styles.error}>{errors.last_name}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
            {errors.username && <span className={styles.error}>{errors.username}</span>}
          </div>
          <div className={styles.formGroup}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
            {errors.email && <span className={styles.error}>{errors.email}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
            {errors.password && <span className={styles.error}>{errors.password}</span>}
          </div>
          <div className={styles.formGroup}>
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirm Password"
              value={formData.confirm_password}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
            {errors.confirm_password && <span className={styles.error}>{errors.confirm_password}</span>}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Contact Information</h4>
        <div className={styles.formGroup}>
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className={styles.formInput}
          />
          {errors.phone && <span className={styles.error}>{errors.phone}</span>}
        </div>
      </div>

      {/* Security Information */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Security Information</h4>
        <div className={styles.formGroup}>
          <select
            name="security_question"
            value={formData.security_question}
            onChange={handleChange}
            className={styles.formInput}
          >
            <option value="mother_maiden_name">Mother's maiden name</option>
            <option value="first_pet">Name of your first pet</option>
            <option value="birth_city">City you were born in</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <input
            type="text"
            name="security_answer"
            placeholder="Security Answer"
            value={formData.security_answer}
            onChange={handleChange}
            className={styles.formInput}
            required
          />
          {errors.security_answer && <span className={styles.error}>{errors.security_answer}</span>}
        </div>
      </div>

      {/* Address Information */}
      <div className={styles.formSection}>
        <h4 className={styles.sectionTitle}>Address Information</h4>
        <div className={styles.formGroup}>
          <input
            type="text"
            name="address_line_1"
            placeholder="Address Line 1"
            value={formData.address_line_1}
            onChange={handleChange}
            className={styles.formInput}
            required
          />
          {errors.address_line_1 && <span className={styles.error}>{errors.address_line_1}</span>}
        </div>
        <div className={styles.formGroup}>
          <input
            type="text"
            name="address_line_2"
            placeholder="Address Line 2 (Optional)"
            value={formData.address_line_2}
            onChange={handleChange}
            className={styles.formInput}
          />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
            {errors.city && <span className={styles.error}>{errors.city}</span>}
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="state"
              placeholder="State/Province"
              value={formData.state}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
            {errors.state && <span className={styles.error}>{errors.state}</span>}
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="post_code"
              placeholder="Postal/Zip Code"
              value={formData.post_code}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
            {errors.post_code && <span className={styles.error}>{errors.post_code}</span>}
          </div>
          <div className={styles.formGroup}>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={styles.formInput}
              required
            >
              <option value="Nigeria">Nigeria</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {formData.role === 'service_provider' && (
          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Service Provider Details</h4>

            {/* Two-column row */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="company_name"
                  placeholder="Company Name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
                {errors.company_name && <span className={styles.error}>{errors.company_name}</span>}
              </div>

              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="service_type"
                  placeholder="Type of Service"
                  value={formData.service_type}
                  onChange={handleChange}
                  className={styles.formInput}
                  required
                />
                {errors.service_type && <span className={styles.error}>{errors.service_type}</span>}
              </div>
            </div>

            {/* Full width file upload */}
            <div className={styles.formGroup}>
              <label htmlFor="license_documents" className={styles.fileLabel}>
                Upload License Documents
              </label>
              <input
                type="file"
                name="license_documents"
                id="license_documents"
                accept=".pdf,.doc,.docx,.jpg,.png"
                multiple
                onChange={handleChange}
                className={styles.formInput}
              />
              {errors.license_documents && (
                <span className={styles.error}>{errors.license_documents}</span>
              )}
            </div>
          </div>
        )}
      {/* reCAPTCHA */}
      <div className={styles.formGroup}>
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={onReCAPTCHAChange}
        />
        {errors.recaptcha_token && <span className={styles.error}>{errors.recaptcha_token}</span>}
      </div>

      {/* Submit Button */}
      <button 
        type="submit" 
        className={styles.submitBtn}
        disabled={isLoading}
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>

      {/* Switch to Login */}
      <div className={styles.links}>
        <button 
          type="button" 
          className={styles.linkBtn}
          onClick={switchToLogin}
        >
          Already have an account? Login
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;