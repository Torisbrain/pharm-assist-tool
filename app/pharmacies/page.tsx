export default function PharmaciesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 text-center">
      <h1 className="text-3xl font-bold text-green-900">Find a pharmacist</h1>
      <p className="text-gray-600">
        Licensed pharmacy listings are coming soon. For urgent concerns, visit a
        registered pharmacy near you or call NAFDAC on 0800-162-3324.
      </p>
      <div className="rounded-2xl border border-green-100 bg-white p-6 text-left shadow-sm">
        <h2 className="font-semibold text-green-900">While you wait</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-gray-700">
          <li>Bring your medicine packaging to the pharmacy counter.</li>
          <li>Ask the pharmacist to verify the NAFDAC registration number.</li>
          <li>Do not take medicines flagged as counterfeit or unregistered.</li>
        </ul>
      </div>
    </div>
  )
}
