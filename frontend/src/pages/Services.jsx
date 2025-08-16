import React from "react";
import '../styles/services.css';
import ServiceCard from "../components/ServiceCard";
import '../styles/pageBackground.css';

import { FaCarCrash, FaTools, FaBatteryFull, FaMapMarkerAlt } from "react-icons/fa";

const Services = () => {
  const services = [
    {
      icon: <FaCarCrash />,
      title: "Accident Assistance",
      description: "Immediate roadside help after an accident, with emergency contacts and support."
    },
    {
      icon: <FaTools />,
      title: "Mechanical Repair",
      description: "On-site mechanical help to fix common breakdown issues."
    },
    {
      icon: <FaBatteryFull />,
      title: "Battery Jumpstart",
      description: "Dead battery? We'll get you running again in minutes."
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Location Tracking",
      description: "Real-time tracking to help our team reach you faster."
    }
  ];

  return (
    <div className="page-background">
    <section className="services-section">
      <div className="services-container">
        <h2 className="services-heading">Our Services</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              title={service.title}
              description={service.description}
            />
          ))}
        </div>
      </div>
    </section>
    </div>
  );
};

export default Services;
