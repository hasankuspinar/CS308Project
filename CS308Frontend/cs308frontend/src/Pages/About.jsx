import React from "react";
import { Container, Row, Col, Image, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./About.css";
import aboutImage1 from "/assets/about-image.png"; 
import aboutImage2 from "/assets/about-image2.png"; 

const About = () => {
  return (
    <Container className="py-5 about-container">
      <Row className="align-items-center">

        <Col md={6} className="text-center text-md-start">
          <h1 className="fw-bold display-4">About CHANTA</h1>
          <p className="lead text-muted">
            CHANTA is a premium e-commerce brand specializing in stylish and modern bags for men, women, and unisex collections. 
            Designed with elegance and functionality in mind, our collections offer timeless pieces that enhance every outfit.
          </p>
          <p>
            Whether you need a sleek handbag, a durable backpack, or an everyday crossbody, CHANTA brings you the perfect 
            blend of sophistication and practicality. Elevate your style with our exclusive designs!
          </p>
          <Button as={NavLink} to="/home" variant="dark" className="px-4 py-2 mt-3">
            Explore Our Collection
          </Button>
        </Col>


        <Col md={6} className="text-center">
          <Image src={aboutImage1} alt="CHANTA Bags" fluid className="rounded shadow" />
        </Col>
      </Row>


      <Row className="mt-5">
        <Col className="text-left d-flex justify-content-center">
          <Image src={aboutImage2} alt="Elegant CHANTA Bags" fluid className="rounded shadow-lg w-75" />
        </Col>
      </Row>
    </Container>
  );
};

export default About;
