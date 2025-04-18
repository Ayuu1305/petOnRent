import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import {
  FiShield,
  FiPlus,
  FiFileText,
  FiAlertCircle,
  FiUser,
  FiTag,
  FiArrowLeft,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import { motion } from "framer-motion";
import { API_URL } from "../utils/api";

const InsurancePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    petName: "",
    petType: "",
    breed: "",
    age: "",
    gender: "",
    medicalHistory: "",
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedPet, setSelectedPet] = useState(null);
  const [insurancePlans, setInsurancePlans] = useState([
    {
      _id: "basic_plan",
      name: "Basic Plan",
      price: 499,
      coverage: 10000,
      benefits: ["Accident coverage", "Emergency care", "Basic medications"],
    },
    {
      _id: "standard_plan",
      name: "Standard Plan",
      price: 999,
      coverage: 25000,
      benefits: [
        "All basic plan benefits",
        "Surgeries",
        "Hospitalization",
        "Medications",
      ],
    },
    {
      _id: "premium_plan",
      name: "Premium Plan",
      price: 1999,
      coverage: 50000,
      benefits: [
        "All standard plan benefits",
        "Preventive care",
        "Dental care",
        "Specialist consultations",
      ],
    },
  ]);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [claimFormData, setClaimFormData] = useState({
    amount: "",
    reason: "",
    description: "",
    documents: null,
  });

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.replace("/login");
      return;
    }

    // Fetch user's insurance policies
    fetchInsurances();

    // Load selected pet data from localStorage
    const petData = localStorage.getItem("selectedPetForInsurance");
    if (petData) {
      try {
        const pet = JSON.parse(petData);
        setSelectedPet(pet);
        // Pre-fill form data
        setFormData({
          petName: pet.name || "",
          petType: pet.type || "",
          breed: pet.breed || "",
          age: pet.age || "",
          gender: pet.gender || "",
          medicalHistory: pet.medicalHistory || "",
        });
      } catch (error) {
        console.error("Error loading pet data:", error);
      }
    }
  }, [user, router]);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/insurance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch insurance policies");
      }

      const data = await response.json();
      console.log("Insurance data received:", data);
      setInsurances(data.policies || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching insurance policies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this insurance policy?"))
      return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/insurance/${id}/cancel`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to cancel insurance policy"
        );
      }

      setSuccessMessage("Insurance policy cancelled successfully!");
      fetchInsurances();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message);
      console.error("Error cancelling insurance policy:", err);
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
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanColor = (planType) => {
    switch (planType) {
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "standard":
        return "bg-purple-100 text-purple-800";
      case "premium":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.petName) errors.petName = "Pet name is required";
    if (!formData.petType) errors.petType = "Pet type is required";
    if (!formData.breed) errors.breed = "Breed is required";
    if (!formData.age) errors.age = "Age is required";
    if (!formData.gender) errors.gender = "Gender is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const requestBody = {
        userId: user._id,
        petId: new mongoose.Types.ObjectId(),
        petName: formData.petName,
        petType: formData.petType,
        breed: formData.breed,
        age: parseInt(formData.age),
        gender: formData.gender,
        medicalHistory: formData.medicalHistory,
        planType: selectedPlan._id.split("_")[0],
        planName: selectedPlan.name,
        coverageAmount: selectedPlan.coverage,
        monthlyPremium: selectedPlan.price,
        benefits: selectedPlan.benefits,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: "active",
      };

      console.log("Sending insurance request:", requestBody);

      const response = await fetch(`${API_URL}/insurance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add insurance policy");
      }

      // If this came from cart, update cart data
      const selectedPetData = localStorage.getItem("selectedPetForInsurance");
      if (selectedPetData) {
        const selectedPet = JSON.parse(selectedPetData);
        if (selectedPet.fromCart) {
          // Get current cart data
          const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
          const currentInsurances =
            JSON.parse(localStorage.getItem("selectedInsurances")) || {};

          // Create insurance object for cart
          const cartInsurance = {
            _id: data._id,
            name: selectedPlan.name,
            price: selectedPlan.price,
            coverage: selectedPlan.coverage,
            benefits: selectedPlan.benefits,
            planType: selectedPlan._id.split("_")[0],
            status: "active",
            startDate: new Date().toISOString(),
            endDate: new Date(
              new Date().setFullYear(new Date().getFullYear() + 1)
            ).toISOString(),
            petDetails: {
              ...formData,
              cartItemId: selectedPet.cartItemId,
            },
            cartItemId: selectedPet.cartItemId,
          };

          // Update insurances in localStorage
          currentInsurances[selectedPet.cartItemId] = cartInsurance;
          localStorage.setItem(
            "selectedInsurances",
            JSON.stringify(currentInsurances)
          );

          // Update cart items with insurance
          const updatedCart = currentCart.map((item) => {
            if (item.cartItemId === selectedPet.cartItemId) {
              return {
                ...item,
                insurance: cartInsurance,
              };
            }
            return item;
          });
          localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
      }

      setSuccessMessage("Insurance policy added successfully!");
      setShowForm(false);
      setFormData({
        petName: "",
        petType: "",
        breed: "",
        age: "",
        gender: "",
        medicalHistory: "",
      });
      setSelectedPlan(null);
      fetchInsurances();

      // Clear selected pet data
      localStorage.removeItem("selectedPetForInsurance");

      // If this came from cart, go back to previous page
      if (selectedPetData) {
        const selectedPet = JSON.parse(selectedPetData);
        if (selectedPet.fromCart) {
          router.back();
        }
      }

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message);
      console.error("Error adding insurance policy:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleAddInsurance = () => {
    if (!selectedPet || !selectedPlan) return;

    // Create insurance object with all required fields
    const insurance = {
      _id: selectedPlan._id,
      name: selectedPlan.name,
      price: selectedPlan.price,
      coverage: selectedPlan.coverage,
      benefits: selectedPlan.benefits,
      petDetails: {
        ...formData,
        cartItemId: selectedPet.cartItemId,
      },
      startDate: new Date().toISOString(),
      endDate: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString(),
      // Add these fields for cart integration
      planType: selectedPlan._id.split("_")[0],
      planName: selectedPlan.name,
      coverageAmount: selectedPlan.coverage,
      monthlyPremium: selectedPlan.price,
      status: "active",
      cartItemId: selectedPet.cartItemId,
      fromCart: selectedPet.fromCart || false,
      returnToCart: selectedPet.returnToCart || false,
    };

    // Store in localStorage for cart to pick up
    localStorage.setItem("newInsuranceAdded", JSON.stringify(insurance));

    // Clear selected pet data
    localStorage.removeItem("selectedPetForInsurance");

    // If this came from cart, return to cart
    if (selectedPet.fromCart) {
      router.push("/cart");
    } else {
      // Otherwise, stay on insurance page
      router.push("/my-insurance");
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInsurance) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("amount", claimFormData.amount);
      formData.append("reason", claimFormData.reason);
      formData.append("description", claimFormData.description);
      if (claimFormData.documents) {
        formData.append("documents", claimFormData.documents);
      }

      const response = await fetch(
        `${API_URL}/insurance/${selectedInsurance._id}/claim`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit claim");
      }

      setSuccessMessage("Claim submitted successfully!");
      setShowClaimForm(false);
      setClaimFormData({
        amount: "",
        reason: "",
        description: "",
        documents: null,
      });
      fetchInsurances(); // Refresh insurance data

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.message);
      console.error("Error submitting claim:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black">Pet Insurance</h1>
          <p className="mt-2 text-black">
            Manage your pet health insurance policies
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
              Your Insurance Policies
            </h2>
            <button
              onClick={() => {
                setShowForm(true);
                setError(null);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              Add Insurance
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-black">Loading insurance policies...</p>
              </div>
            ) : showForm ? (
              <div className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Pet Name
                      </label>
                      <input
                        type="text"
                        name="petName"
                        value={formData.petName}
                        onChange={handleChange}
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
                        Pet Type
                      </label>
                      <select
                        name="petType"
                        value={formData.petType}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${
                          formErrors.petType ? "border-red-300" : ""
                        }`}
                      >
                        <option value="">Select pet type</option>
                        <option value="dog">Dog</option>
                        <option value="cat">Cat</option>
                        <option value="bird">Bird</option>
                        <option value="other">Other</option>
                      </select>
                      {formErrors.petType && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.petType}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Breed
                      </label>
                      <input
                        type="text"
                        name="breed"
                        value={formData.breed}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${
                          formErrors.breed ? "border-red-300" : ""
                        }`}
                      />
                      {formErrors.breed && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.breed}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        min="0"
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${
                          formErrors.age ? "border-red-300" : ""
                        }`}
                      />
                      {formErrors.age && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.age}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${
                          formErrors.gender ? "border-red-300" : ""
                        }`}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {formErrors.gender && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.gender}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black mb-1">
                        Medical History (Optional)
                      </label>
                      <textarea
                        name="medicalHistory"
                        value={formData.medicalHistory}
                        onChange={handleChange}
                        rows="3"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-black mb-4">
                      Select Insurance Plan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {insurancePlans.map((plan) => (
                        <div
                          key={plan._id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedPlan?._id === plan._id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:border-gray-400"
                          }`}
                          onClick={() => handlePlanSelect(plan)}
                        >
                          <h4 className="font-semibold text-black">
                            {plan.name}
                          </h4>
                          <p className="text-2xl font-bold text-blue-600 mt-2">
                            ₹{plan.price}/month
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Coverage up to ₹{plan.coverage.toLocaleString()}
                          </p>
                          <ul className="mt-3 space-y-1 text-sm text-gray-600">
                            {plan.benefits.map((benefit, index) => (
                              <li key={index} className="flex items-center">
                                <FiShield className="mr-2 text-blue-500" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setError(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-black bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !selectedPlan}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Adding..." : "Add Insurance Policy"}
                    </button>
                  </div>
                </form>
              </div>
            ) : insurances.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <FiShield className="text-gray-400 text-5xl" />
                </div>
                <p className="text-black mb-4">
                  You don't have any insurance policies yet.
                </p>
                <p className="text-black mb-6">
                  Protect your pets with our comprehensive insurance plans.
                </p>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setError(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiPlus className="mr-2" />
                  Add Your First Policy
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {insurances.map((insurance) => (
                  <div
                    key={insurance._id}
                    className="border rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="font-medium text-black">
                          {insurance.petName}
                        </span>
                        <span
                          className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            insurance.status
                          )}`}
                        >
                          {insurance.status.charAt(0).toUpperCase() +
                            insurance.status.slice(1)}
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPlanColor(
                            insurance.planType
                          )}`}
                        >
                          {insurance.planType.charAt(0).toUpperCase() +
                            insurance.planType.slice(1)}
                        </span>
                      </div>
                      {insurance.status === "active" && (
                        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                        <button
                          onClick={() => handleCancel(insurance._id)}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm"
                        >
                          <FiAlertCircle className="mr-1" />
                          Cancel
                        </button>
                          <button
                            onClick={() => {
                              setSelectedInsurance(insurance);
                              setShowClaimForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                          >
                            <FiFileText className="mr-1" />
                            File Claim
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-black mb-2">
                            <span className="font-medium">Coverage:</span> ₹
                            {insurance.coverageAmount.toLocaleString()}
                          </div>
                          <div className="text-black mb-2">
                            <span className="font-medium">Premium:</span> ₹
                            {insurance.monthlyPremium}/month
                          </div>
                        </div>
                        <div>
                          <div className="text-black mb-2">
                            <span className="font-medium">Start Date:</span>{" "}
                            {formatDate(insurance.startDate)}
                          </div>
                          <div className="text-black">
                            <span className="font-medium">End Date:</span>{" "}
                            {formatDate(insurance.endDate)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-black mb-1">
                          Benefits:
                        </h4>
                        <ul className="list-disc pl-5 text-black text-sm">
                          {insurance.benefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                      {insurance.claimHistory &&
                        insurance.claimHistory.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-medium text-black mb-2 flex items-center">
                              <FiFileText className="mr-1" />
                              Claim History:
                            </h4>
                            <div className="space-y-2">
                              {insurance.claimHistory.map((claim, index) => (
                                <div
                                  key={index}
                                  className="text-sm bg-gray-50 p-2 rounded"
                                >
                                  <div className="flex justify-between">
                                    <span className="text-black">
                                      {formatDate(claim.date)}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 text-xs rounded-full ${
                                        claim.status === "approved"
                                          ? "bg-green-100 text-green-800"
                                          : claim.status === "rejected"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {claim.status.charAt(0).toUpperCase() +
                                        claim.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-black">
                                    <span className="font-medium">Amount:</span>{" "}
                                    ₹{claim.amount.toLocaleString()}
                                  </div>
                                  <div className="mt-1 text-black">
                                    <span className="font-medium">Reason:</span>{" "}
                                    {claim.reason}
                                  </div>
                                  {claim.description && (
                                    <div className="mt-1 text-black">
                                      <span className="font-medium">
                                        Description:
                                      </span>{" "}
                                      {claim.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
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
              About Our Pet Insurance
            </h2>
            <div className="prose max-w-none text-black">
              <p>
                Our pet insurance plans provide comprehensive coverage for your
                beloved pets, ensuring they receive the best care when they need
                it most.
              </p>
              <h3 className="text-lg font-medium text-black mt-4">
                Available Plans:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-blue-600">Basic Plan</h4>
                  <p className="text-2xl font-bold mt-1">₹499/month</p>
                  <p className="text-sm text-black mb-2">
                    Coverage up to ₹10,000
                  </p>
                  <ul className="text-sm space-y-1 text-black">
                    <li>• Accident coverage</li>
                    <li>• Emergency care</li>
                    <li>• Basic medications</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-purple-600">
                    Standard Plan
                  </h4>
                  <p className="text-2xl font-bold mt-1">₹999/month</p>
                  <p className="text-sm text-black mb-2">
                    Coverage up to ₹25,000
                  </p>
                  <ul className="text-sm space-y-1 text-black">
                    <li>• All basic plan benefits</li>
                    <li>• Surgeries</li>
                    <li>• Hospitalization</li>
                    <li>• Medications</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-600">
                    Premium Plan
                  </h4>
                  <p className="text-2xl font-bold mt-1">₹1,999/month</p>
                  <p className="text-sm text-black mb-2">
                    Coverage up to ₹50,000
                  </p>
                  <ul className="text-sm space-y-1 text-black">
                    <li>• All standard plan benefits</li>
                    <li>• Preventive care</li>
                    <li>• Dental care</li>
                    <li>• Specialist consultations</li>
                  </ul>
                </div>
              </div>
              <p className="mt-4 text-black">
                For more information about our insurance plans or to file a
                claim, please contact our customer support at{" "}
                <strong>support@petonrent.com</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Claim Form Modal */}
        {showClaimForm && selectedInsurance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-black">
                  Submit Insurance Claim
                </h3>
                <button
                  onClick={() => {
                    setShowClaimForm(false);
                    setSelectedInsurance(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleClaimSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Claim Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={claimFormData.amount}
                    onChange={(e) =>
                      setClaimFormData({
                        ...claimFormData,
                        amount: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                    required
                    max={selectedInsurance.coverageAmount}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Reason for Claim
                  </label>
                  <select
                    value={claimFormData.reason}
                    onChange={(e) =>
                      setClaimFormData({
                        ...claimFormData,
                        reason: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                    required
                  >
                    <option value="">Select reason</option>
                    <option value="accident">Accident</option>
                    <option value="illness">Illness</option>
                    <option value="surgery">Surgery</option>
                    <option value="medication">Medication</option>
                    <option value="checkup">Regular Checkup</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Description
                  </label>
                  <textarea
                    value={claimFormData.description}
                    onChange={(e) =>
                      setClaimFormData({
                        ...claimFormData,
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Supporting Documents
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setClaimFormData({
                        ...claimFormData,
                        documents: e.target.files[0],
                      })
                    }
                    className="w-full text-black"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-black mt-1">
                    Upload bills, prescriptions, or other relevant documents
                    (PDF, JPG, PNG)
                  </p>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowClaimForm(false);
                      setSelectedInsurance(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "Submit Claim"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsurancePage;
