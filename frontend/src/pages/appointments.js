import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import {
  FiCalendar,
  FiClock,
  FiHome,
  FiPlus,
  FiTrash2,
  FiEdit,
} from "react-icons/fi";
import { API_URL } from "../utils/api";

const AppointmentPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    petId: "",
    petName: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    isHomeVisit: false,
    address: "",
    notes: "",
  });
  const [userPets, setUserPets] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.replace("/login");
      return;
    }

    // Fetch user's appointments
    fetchAppointments();

    // Fetch user's pets
    fetchUserPets();
  }, [user, router]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/appointments`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      console.log("Appointments data received:", data);
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPets = async () => {
    try {
      // This endpoint should return pets owned by the user
      const response = await fetch(`http://localhost:5000/api/pets/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch pets");
      }

      const data = await response.json();
      console.log("User pets data received:", data);
      if (data.success) {
        setUserPets(data.pets || []);
      } else {
        console.error("Error in response:", data.message);
        setUserPets([]);
      }
    } catch (err) {
      console.error("Error fetching user pets:", err);
      setUserPets([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handlePetSelect = (e) => {
    const selectedPet = userPets.find((pet) => pet._id === e.target.value);
    if (selectedPet) {
      setFormData({
        ...formData,
        petId: selectedPet._id,
        petName: selectedPet.name,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.petId) errors.petId = "Please select a pet";
    if (!formData.petName) errors.petName = "Pet name is required";
    if (!formData.appointmentDate) errors.appointmentDate = "Date is required";
    if (!formData.appointmentTime) errors.appointmentTime = "Time is required";
    if (!formData.reason) errors.reason = "Reason is required";
    if (formData.isHomeVisit && !formData.address)
      errors.address = "Address is required for home visits";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to book appointment");
      }

      const data = await response.json();
      setSuccessMessage("Appointment booked successfully!");
      setFormData({
        petId: "",
        petName: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: "",
        isHomeVisit: false,
        address: "",
        notes: "",
      });
      setShowForm(false);
      fetchAppointments();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message);
      console.error("Error booking appointment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/appointments/${id}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel appointment");
      }

      setSuccessMessage("Appointment cancelled successfully!");
      fetchAppointments();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message);
      console.error("Error cancelling appointment:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Doctor Appointments</h1>
          <p className="mt-2 text-black">
            Book and manage veterinary appointments for your pets
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-center">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-center">
            {error}
            <button className="ml-2 underline" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="p-6 flex justify-between items-center border-b">
            <h2 className="text-xl font-semibold text-black">
              Your Appointments
            </h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showForm ? (
                "Cancel"
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Book New
                </>
              )}
            </button>
          </div>

          {showForm && (
            <div className="p-6 border-b">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Select Pet
                    </label>
                    <select
                      name="petId"
                      value={formData.petId}
                      onChange={handlePetSelect}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${
                        formErrors.petId ? "border-red-300" : ""
                      }`}
                    >
                      <option value="">Select a pet</option>
                      {userPets.map((pet) => (
                        <option key={pet._id} value={pet._id}>
                          {pet.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.petId && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.petId}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Pet Name
                    </label>
                    <input
                      type="text"
                      name="petName"
                      value={formData.petName}
                      onChange={handleChange}
                      placeholder="Enter pet name if not in list"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${
                        formErrors.petName ? "border-red-300" : ""
                      }`}
                    />
                    {formErrors.petName && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.petName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${
                        formErrors.appointmentDate ? "border-red-300" : ""
                      }`}
                    />
                    {formErrors.appointmentDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.appointmentDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Appointment Time
                    </label>
                    <select
                      name="appointmentTime"
                      value={formData.appointmentTime}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${
                        formErrors.appointmentTime ? "border-red-300" : ""
                      }`}
                    >
                      <option value="">Select a time</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                    </select>
                    {formErrors.appointmentTime && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.appointmentTime}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">
                      Reason for Visit
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Describe the reason for your appointment"
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${
                        formErrors.reason ? "border-red-300" : ""
                      }`}
                    ></textarea>
                    {formErrors.reason && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.reason}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isHomeVisit"
                        name="isHomeVisit"
                        checked={formData.isHomeVisit}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isHomeVisit"
                        className="ml-2 block text-sm text-black"
                      >
                        Request home visit (additional charges may apply)
                      </label>
                    </div>
                  </div>

                  {formData.isHomeVisit && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-1">
                        Home Address
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Enter your complete address for home visit"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${
                          formErrors.address ? "border-red-300" : ""
                        }`}
                      ></textarea>
                      {formErrors.address && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.address}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="2"
                      placeholder="Any additional information you'd like to provide"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-black bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Booking..." : "Book Appointment"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            {loading && !showForm ? (
              <div className="text-center py-8">
                <p className="text-black">Loading appointments...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-black">
                  You don't have any appointments yet.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="mr-2" />
                  Book Your First Appointment
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {appointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="border rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-medium text-black">
                          {appointment.petName}
                        </span>
                        <span
                          className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </span>
                      </div>
                      {appointment.status === "pending" && (
                        <button
                          onClick={() => handleCancel(appointment._id)}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm"
                        >
                          <FiTrash2 className="mr-1" />
                          Cancel
                        </button>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center text-black mb-2">
                            <FiCalendar className="mr-2" />
                            <span>
                              {formatDate(appointment.appointmentDate)}
                            </span>
                          </div>
                          <div className="flex items-center text-black">
                            <FiClock className="mr-2" />
                            <span>{appointment.appointmentTime}</span>
                          </div>
                        </div>
                        <div>
                          {appointment.isHomeVisit && (
                            <div className="flex items-center text-black mb-2">
                              <FiHome className="mr-2" />
                              <span>Home Visit</span>
                            </div>
                          )}
                          <div className="text-black">
                            <span className="font-medium">Doctor:</span>{" "}
                            {appointment.doctorName}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-black">
                          Reason:
                        </h4>
                        <p className="text-black mt-1">{appointment.reason}</p>
                      </div>
                      {appointment.notes && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-black">
                            Notes:
                          </h4>
                          <p className="text-black mt-1">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-black mb-4">
              About Our Veterinary Services
            </h2>
            <div className="prose max-w-none text-black">
              <p>
                Our experienced veterinarians provide comprehensive care for all
                your pet's health needs. From routine check-ups to emergency
                care, we're here to ensure your pet stays healthy and happy.
              </p>
              <h3 className="text-lg font-medium text-black mt-4">
                Services We Offer:
              </h3>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-black">
                <li>Routine check-ups and vaccinations</li>
                <li>Dental care and cleaning</li>
                <li>Surgery and specialized treatments</li>
                <li>Emergency and critical care</li>
                <li>Nutritional counseling</li>
                <li>Home visits for pets with mobility issues or stress</li>
              </ul>
              <p className="mt-4 text-black">
                For emergencies outside of appointment hours, please call our
                24/7 emergency line at <strong>1800-PET-HELP</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage;
