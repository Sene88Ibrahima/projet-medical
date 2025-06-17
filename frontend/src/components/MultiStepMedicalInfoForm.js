import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiUser, FiHeart, FiUsers, FiPlus, FiX, FiCheck } from 'react-icons/fi';

/*
  MultiStepMedicalInfoForm – Formulaire médical divisé en 3 étapes :
  1. Informations générales (taille, poids, groupe sanguin) – affiche IMC en direct
  2. Antécédents médicaux – tableau dynamique de conditions + interventions
  3. Antécédents familiaux – tableau dynamique de maladies familiales

  Le composant reste purement front-end ; la validation simple est effectuée côté client.
  Les styles reposent sur Tailwind CSS et s'alignent visuellement sur le template fourni.
*/

const steps = [
  {
    key: 'general',
    title: 'Informations générales',
    Icon: FiUser,
  },
  {
    key: 'medical',
    title: 'Antécédents médicaux',
    Icon: FiHeart,
  },
  {
    key: 'family',
    title: 'Antécédents familiaux',
    Icon: FiUsers,
  },
];

const emptyCondition = { condition: '', year: '', details: '' };
const emptyFamilyCondition = { relation: '', condition: '', details: '' };

const MultiStepMedicalInfoForm = ({ onSubmit }) => {
  const [current, setCurrent] = useState(0);
  const [data, setData] = useState({
    general: { height: '', weight: '', bloodGroup: '' },
    medical: { conditions: [ { ...emptyCondition } ] },
    family: { conditions: [ { ...emptyFamilyCondition } ] },
  });

  // helpers
  const updateField = (stepKey, field, value) => {
    setData((prev) => ({
      ...prev,
      [stepKey]: { ...prev[stepKey], [field]: value },
    }));
  };

  const updateArrayField = (stepKey, index, field, value) => {
    setData((prev) => {
      const arr = [...prev[stepKey].conditions];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [stepKey]: { conditions: arr } };
    });
  };

  const addArrayItem = (stepKey, template) => {
    setData((prev) => ({
      ...prev,
      [stepKey]: { conditions: [...prev[stepKey].conditions, { ...template }] },
    }));
  };

  const removeArrayItem = (stepKey, index) => {
    setData((prev) => {
      const arr = prev[stepKey].conditions.filter((_, i) => i !== index);
      return { ...prev, [stepKey]: { conditions: arr.length ? arr : [ { ...(stepKey==='medical' ? emptyCondition : emptyFamilyCondition) } ] } };
    });
  };

  const next = () => setCurrent((c) => Math.min(c + 1, steps.length - 1));
  const prev = () => setCurrent((c) => Math.max(c - 1, 0));

  const handleFinish = () => {
    onSubmit({
      ...data.general,
      medicalHistory: data.medical.conditions,
      familyHistory: data.family.conditions,
    });
  };

  // BMI calculation
  const bmi = () => {
    const h = parseFloat(data.general.height) / 100;
    const w = parseFloat(data.general.weight);
    if (!h || !w) return null;
    return (w / (h * h)).toFixed(1);
  };

  // RENDERERS -------------------------------------------------------------
  const renderStepHeader = () => (
    <div>
      <div className="flex items-center justify-between mb-4 px-2">
        {steps.map((s, idx) => {
          const Icon = s.Icon;
          const active = idx === current;
          const completed = idx < current;
          return (
            <div key={s.key} className="flex-1 flex flex-col items-center text-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white shrink-0 ${
                  completed ? 'bg-green-500' : active ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                {completed ? <FiCheck size={18} /> : <Icon size={18} />}
              </div>
              <span className={`text-xs mt-1 ${completed ? 'text-green-600' : active ? 'text-blue-600' : 'text-gray-500'}`}>{s.title}</span>
            </div>
          );
        })}
      </div>
      {/* progress bar */}
      <div className="h-1 w-full bg-gray-200 rounded">
        <div
          className="h-full bg-blue-600 rounded transition-all"
          style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );

  const renderGeneral = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Taille (cm) *</label>
          <input type="number" name="height" value={data.general.height} onChange={(e)=>updateField('general','height',e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Poids (kg) *</label>
          <input type="number" name="weight" value={data.general.weight} onChange={(e)=>updateField('general','weight',e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Groupe sanguin *</label>
          <input type="text" name="bloodGroup" value={data.general.bloodGroup} onChange={(e)=>updateField('general','bloodGroup',e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300" required />
        </div>
      </div>
      {bmi() && (
        <div className="p-4 bg-blue-50 rounded-md text-sm">
          <p className="font-medium text-blue-600">Indice de Masse Corporelle (IMC)</p>
          <p>Votre IMC est de <span className="font-semibold">{bmi()}</span></p>
        </div>
      )}
    </div>
  );

  const renderMedicalHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Antécédents médicaux personnels</h3>
        <button type="button" onClick={()=>addArrayItem('medical', emptyCondition)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"><FiPlus/>Ajouter</button>
      </div>
      {data.medical.conditions.map((c, idx)=>(
        <div key={idx} className="border rounded p-4 space-y-3 relative">
          <button type="button" className="absolute top-2 right-2 text-red-500" onClick={()=>removeArrayItem('medical', idx)}><FiX/></button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Maladie/Condition</label>
              <input className="w-full border rounded px-3 py-2" value={c.condition} onChange={(e)=>updateArrayField('medical', idx,'condition', e.target.value)} placeholder="Ex: Hypertension" />
            </div>
            <div>
              <label className="block text-sm mb-1">Année de diagnostic</label>
              <input className="w-full border rounded px-3 py-2" value={c.year} onChange={(e)=>updateArrayField('medical', idx,'year', e.target.value)} placeholder="Ex: 2020" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Détails supplémentaires</label>
            <textarea rows="3" className="w-full border rounded px-3 py-2" value={c.details} onChange={(e)=>updateArrayField('medical', idx,'details', e.target.value)} placeholder="Traitements, évolution..." />
          </div>
        </div>
      ))}
    </div>
  );

  const renderFamilyHistory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Antécédents familiaux</h3>
        <button type="button" onClick={()=>addArrayItem('family', emptyFamilyCondition)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"><FiPlus/>Ajouter</button>
      </div>
      {data.family.conditions.map((c, idx)=>(
        <div key={idx} className="border rounded p-4 space-y-3 relative">
          <button type="button" className="absolute top-2 right-2 text-red-500" onClick={()=>removeArrayItem('family', idx)}><FiX/></button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Lien de parenté</label>
              <input className="w-full border rounded px-3 py-2" value={c.relation} onChange={(e)=>updateArrayField('family', idx,'relation', e.target.value)} placeholder="Ex: Père" />
            </div>
            <div>
              <label className="block text-sm mb-1">Condition</label>
              <input className="w-full border rounded px-3 py-2" value={c.condition} onChange={(e)=>updateArrayField('family', idx,'condition', e.target.value)} placeholder="Ex: Diabète" />
            </div>
            <div>
              <label className="block text-sm mb-1">Détails</label>
              <input className="w-full border rounded px-3 py-2" value={c.details} onChange={(e)=>updateArrayField('family', idx,'details', e.target.value)} placeholder="Informations…" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const stepContent = [renderGeneral(), renderMedicalHistory(), renderFamilyHistory()];

  return (
    <form onSubmit={(e)=>{e.preventDefault(); handleFinish();}} className="w-full max-w-3xl mx-auto bg-white shadow-md rounded-md p-6 space-y-6">
      {renderStepHeader()}

      {/* content */}
      <div>
        {stepContent[current]}
      </div>

      {/* navigation buttons */}
      <div className="flex justify-between pt-4">
        {current > 0 ? (
          <button type="button" onClick={prev} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Précédent</button>
        ) : <span />}
        {current < steps.length -1 ? (
          <button type="button" onClick={next} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Suivant</button>
        ) : (
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Enregistrer</button>
        )}
      </div>
    </form>
  );
};

MultiStepMedicalInfoForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default MultiStepMedicalInfoForm;
