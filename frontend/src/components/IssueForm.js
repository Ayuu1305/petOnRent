import { useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";

const IssueForm = ({ onSubmit, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    issueType: "rental", // rental or purchase
    description: "",
    petCategory: "",
    petName: "",
    priority: "medium",
    status: "pending",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate form data
      if (
        !formData.name ||
        !formData.email ||
        !formData.phone ||
        !formData.description
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Structure the data for submission
      const issueData = {
        ...formData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        expectedResolutionDate: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        assignedTo: "support@petrental.com",
        resolutionNotes:
          "Your issue has been received and will be addressed by our support team.",
        petDetails: {
          category: formData.petCategory || "Not specified",
          name: formData.petName || "Not specified",
        },
      };

      // Call the onSubmit function with the structured data
      await onSubmit(issueData);

      // Show success message
      setIsSubmitted(true);

      // Close the form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full my-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Raise an Issue
          </h3>

          {isSubmitted ? (
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <FiCheck className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Issue Submitted Successfully!
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Your issue has been received and will be addressed by our
                support team.
              </p>
              <p className="text-sm text-gray-500">
                Expected resolution date:{" "}
                {new Date(
                  Date.now() + 5 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
            >
              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="issueType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Issue Type *
                </label>
                <select
                  id="issueType"
                  name="issueType"
                  value={formData.issueType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  required
                >
                  <option value="rental">Rental Issue</option>
                  <option value="purchase">Purchase Issue</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="petCategory"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pet Category
                </label>
                <input
                  type="text"
                  id="petCategory"
                  name="petCategory"
                  value={formData.petCategory}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  placeholder="e.g. Dog, Cat, Bird"
                />
              </div>

              <div>
                <label
                  htmlFor="petName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pet Name
                </label>
                <input
                  type="text"
                  id="petName"
                  name="petName"
                  value={formData.petName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  placeholder="If applicable"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                  required
                  placeholder="Please describe your issue in detail"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Issue"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueForm;
