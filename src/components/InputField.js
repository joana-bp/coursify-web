function InputField({ label, type, value, onChange, placeholder }) {
  return (
    <div className="input-group">
      <label htmlFor="input-field">{label}</label>
      <input
        id="input-field"
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </div>
  );
}

export default InputField;