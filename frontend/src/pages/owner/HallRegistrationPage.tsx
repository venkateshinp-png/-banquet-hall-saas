import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { CheckIcon } from '@heroicons/react/24/solid';
import { hallApi } from '../../api/halls';
import LoadingSpinner from '../../components/LoadingSpinner';

interface HallFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  email: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  termsConditions: string;
}

interface DocumentEntry {
  file: File;
  type: string;
}

const STEPS = [
  'Hall Details',
  'Bank Details',
  'Terms & Conditions',
  'Document Upload',
  'Review & Submit',
];

const DOCUMENT_TYPES = [
  { value: 'BUSINESS_LICENSE', label: 'Business License' },
  { value: 'ID_PROOF', label: 'ID Proof' },
  { value: 'ADDRESS_PROOF', label: 'Address Proof' },
  { value: 'OTHER', label: 'Other' },
];

const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Kochi',
  'Indore',
  'Nagpur',
  'Surat',
];

export default function HallRegistrationPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [selectedDocType, setSelectedDocType] = useState('BUSINESS_LICENSE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<HallFormData>();

  const stepFields: Record<number, (keyof HallFormData)[]> = {
    0: ['name', 'description', 'address', 'city', 'state', 'zipcode', 'phone', 'email'],
    1: ['bankAccountName', 'bankAccountNumber', 'bankRoutingNumber'],
    2: ['termsConditions'],
  };

  const handleNext = async () => {
    if (currentStep < 3) {
      const fields = stepFields[currentStep];
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleAddDocument = () => {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;
    const newDocs: DocumentEntry[] = Array.from(files).map((file) => ({
      file,
      type: selectedDocType,
    }));
    setDocuments((prev) => [...prev, ...newDocs]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: HallFormData) => {
    setError('');
    setSubmitting(true);
    try {
      const hallPayload = {
        name: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        zipcode: data.zipcode,
        phone: data.phone,
        email: data.email,
        bankAccountName: data.bankAccountName,
        bankAccountNumber: data.bankAccountNumber,
        bankRoutingNumber: data.bankRoutingNumber,
        termsConditions: data.termsConditions,
      };

      const hallRes = await hallApi.create(hallPayload);
      const createdHall = hallRes.data.data;

      if (documents.length > 0) {
        const formData = new FormData();
        documents.forEach((doc) => {
          formData.append('files', doc.file);
          formData.append('types', doc.type);
        });
        await hallApi.uploadDocuments(createdHall.id, formData);
      }

      navigate('/owner/dashboard', {
        state: { successMessage: 'Hall registration submitted! Awaiting admin approval.' },
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const values = getValues();

  const inputClass = (field: keyof HallFormData) =>
    `w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20 ${
      errors[field] ? 'border-red-400' : 'border-slate-300'
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Register New Hall</h1>
        <p className="mb-8 text-sm text-slate-500">
          Complete all steps to submit your hall for approval.
        </p>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      i < currentStep
                        ? 'bg-blue-800 text-white'
                        : i === currentStep
                          ? 'bg-blue-800 text-white ring-4 ring-blue-800/20'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {i < currentStep ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`mt-1.5 hidden text-xs sm:block ${
                      i <= currentStep ? 'font-medium text-blue-800' : 'text-slate-400'
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 rounded ${
                      i < currentStep ? 'bg-blue-800' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-sm font-medium text-slate-600 sm:hidden">
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200 sm:p-8"
        >
          {/* Step 1: Hall Details */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">Hall Details</h2>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Hall Name *
                </label>
                <input
                  type="text"
                  className={inputClass('name')}
                  placeholder="e.g. Grand Palace Banquets"
                  {...register('name', { required: 'Hall name is required' })}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  rows={3}
                  className={inputClass('description')}
                  placeholder="Describe your hall..."
                  {...register('description')}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address *
                </label>
                <input
                  type="text"
                  className={inputClass('address')}
                  placeholder="Full street address"
                  {...register('address', { required: 'Address is required' })}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    City *
                  </label>
                  <select
                    className={inputClass('city')}
                    {...register('city', { required: 'City is required' })}
                  >
                    <option value="">Select City</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    State *
                  </label>
                  <input
                    type="text"
                    className={inputClass('state')}
                    placeholder="e.g. Maharashtra"
                    {...register('state', { required: 'State is required' })}
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Zipcode *
                  </label>
                  <input
                    type="text"
                    className={inputClass('zipcode')}
                    placeholder="e.g. 400001"
                    {...register('zipcode', { required: 'Zipcode is required' })}
                  />
                  {errors.zipcode && (
                    <p className="mt-1 text-xs text-red-500">{errors.zipcode.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    className={inputClass('phone')}
                    placeholder="e.g. +91 9876543210"
                    {...register('phone', { required: 'Phone is required' })}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    className={inputClass('email')}
                    placeholder="e.g. contact@hall.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address',
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Bank Details */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">Bank Details</h2>
              <p className="text-sm text-slate-500">
                Required for processing payouts to your account.
              </p>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  className={inputClass('bankAccountName')}
                  placeholder="Name on bank account"
                  {...register('bankAccountName', {
                    required: 'Account holder name is required',
                  })}
                />
                {errors.bankAccountName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.bankAccountName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account Number *
                </label>
                <input
                  type="text"
                  className={inputClass('bankAccountNumber')}
                  placeholder="Bank account number"
                  {...register('bankAccountNumber', {
                    required: 'Account number is required',
                  })}
                />
                {errors.bankAccountNumber && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.bankAccountNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Routing Number *
                </label>
                <input
                  type="text"
                  className={inputClass('bankRoutingNumber')}
                  placeholder="Bank routing / IFSC code"
                  {...register('bankRoutingNumber', {
                    required: 'Routing number is required',
                  })}
                />
                {errors.bankRoutingNumber && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.bankRoutingNumber.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Terms & Conditions */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Terms & Conditions
              </h2>
              <p className="text-sm text-slate-500">
                Provide terms and conditions that customers must agree to when booking
                your venues.
              </p>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Terms Text *
                </label>
                <textarea
                  rows={10}
                  className={inputClass('termsConditions')}
                  placeholder="Enter your terms and conditions here..."
                  {...register('termsConditions', {
                    required: 'Terms & conditions are required',
                  })}
                />
                {errors.termsConditions && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.termsConditions.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Document Upload */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Document Upload
              </h2>
              <p className="text-sm text-slate-500">
                Upload required documents for verification (business license, ID proof,
                etc.).
              </p>

              <div className="rounded-lg border border-dashed border-slate-300 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Document Type
                    </label>
                    <select
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-800/20"
                    >
                      {DOCUMENT_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>
                          {dt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Select Files
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-blue-800 hover:file:bg-blue-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="shrink-0 rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
                  >
                    Upload
                  </button>
                </div>
              </div>

              {documents.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-700">
                    Uploaded Documents ({documents.length})
                  </h3>
                  {documents.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2.5 ring-1 ring-slate-200"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-700">
                          {doc.file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {DOCUMENT_TYPES.find((d) => d.value === doc.type)?.label} &middot;{' '}
                          {(doc.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveDocument(i)}
                        className="ml-3 text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {documents.length === 0 && (
                <p className="text-sm text-slate-400">
                  No documents uploaded yet. You can continue and upload later if needed.
                </p>
              )}
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-900">Review & Submit</h2>
              <p className="text-sm text-slate-500">
                Please review all details before submitting.
              </p>

              {/* Hall Details Review */}
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Hall Details
                </h3>
                <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Name</dt>
                    <dd className="font-medium text-slate-900">{values.name}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Email</dt>
                    <dd className="font-medium text-slate-900">{values.email}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Phone</dt>
                    <dd className="font-medium text-slate-900">{values.phone}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">City</dt>
                    <dd className="font-medium text-slate-900">
                      {values.city}, {values.state} {values.zipcode}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">Address</dt>
                    <dd className="font-medium text-slate-900">{values.address}</dd>
                  </div>
                  {values.description && (
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500">Description</dt>
                      <dd className="font-medium text-slate-900">{values.description}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Bank Details Review */}
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Bank Details
                </h3>
                <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Account Holder</dt>
                    <dd className="font-medium text-slate-900">
                      {values.bankAccountName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Account Number</dt>
                    <dd className="font-medium text-slate-900">
                      ****{values.bankAccountNumber?.slice(-4)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Routing Number</dt>
                    <dd className="font-medium text-slate-900">
                      {values.bankRoutingNumber}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Terms Review */}
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Terms & Conditions
                </h3>
                <p className="max-h-32 overflow-y-auto whitespace-pre-wrap text-sm text-slate-700">
                  {values.termsConditions}
                </p>
              </div>

              {/* Documents Review */}
              <div className="rounded-lg bg-slate-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Documents ({documents.length})
                </h3>
                {documents.length > 0 ? (
                  <ul className="space-y-1 text-sm text-slate-700">
                    {documents.map((doc, i) => (
                      <li key={i}>
                        {DOCUMENT_TYPES.find((d) => d.value === doc.type)?.label}:{' '}
                        <span className="font-medium">{doc.file.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">No documents uploaded.</p>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-lg bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
