import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * MedicalInfoForm - formulaire dynamique destiné au patient pour saisir ses informations médicales de base.
 * Les champs sont définis par le tableau "fields" afin de pouvoir évoluer facilement sans changer le JSX.
 */
const MedicalInfoForm = ({ onSubmit }) => {
  const fields = [
    { name: 'height', label: 'Taille (cm)', type: 'number', placeholder: '180' },
    { name: 'weight', label: 'Poids (kg)', type: 'number', placeholder: '75' },
    { name: 'bloodGroup', label: 'Groupe sanguin', type: 'text', placeholder: 'O+' },
    { name: 'allergies', label: 'Allergies connues', type: 'text', placeholder: 'Pollen, arachides...' },
    { name: 'chronicDiseases', label: 'Maladies chroniques', type: 'text', placeholder: 'Diabète, HTA...' },
    { name: 'currentTreatment', label: 'Traitement en cours', type: 'text', placeholder: 'Metformine...' },
  ];

  const [formData, setFormData] = useState(() =>
    fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {})
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      className="max-w-xl mx-auto p-6 bg-white rounded-md shadow-md" 
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-semibold mb-4 text-center">Mes informations médicales</h2>
      {fields.map(({ name, label, type, placeholder }) => (
        <div key={name} className="mb-4">
          <label htmlFor={name} className="block text-sm font-medium mb-1">
            {label}
          </label>
          <input
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            required={name === 'height' || name === 'weight' || name === 'bloodGroup'}
          />
        </div>
      ))}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Enregistrer
      </button>
    </form>
  );
};

MedicalInfoForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default MedicalInfoForm;
