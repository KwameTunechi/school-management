'use client';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}

export function FormField({
  label, name, type = 'text', defaultValue, required, placeholder, hint,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: '#6b7280' }}
      >
        {label}{required && <span className="ml-0.5" style={{ color: '#ef4444' }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border text-sm text-gray-900
          placeholder-gray-400 outline-none transition-all duration-150 bg-white"
        style={{ borderColor: '#e8eaed' }}
        onFocus={e => { e.currentTarget.style.borderColor = '#c9952a'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201,149,42,0.12)'; }}
        onBlur={e  => { e.currentTarget.style.borderColor = '#e8eaed'; e.currentTarget.style.boxShadow = ''; }}
      />
      {hint && <p className="text-xs mt-1.5" style={{ color: '#9ca3af' }}>{hint}</p>}
    </div>
  );
}

interface AlertProps {
  type: 'error' | 'success';
  message: string;
}

export function Alert({ type, message }: AlertProps) {
  const isError = type === 'error';
  const icon = isError
    ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm border"
      style={{
        backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
        borderColor:     isError ? '#fecaca' : '#bbf7d0',
        color:           isError ? '#dc2626' : '#16a34a',
      }}
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
      </svg>
      {message}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#0d1b2a' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
