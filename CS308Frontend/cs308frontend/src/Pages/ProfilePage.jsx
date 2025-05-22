import React, { useEffect, useState } from "react";
import { Card, Container, Form, Button, Spinner, Alert, Badge, ButtonGroup } from "react-bootstrap";
import axios from "axios";
import { PersonFill, EnvelopeFill, GeoAltFill } from "react-bootstrap-icons";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    axios.get("/auth/getuserdetails")
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios.put("/auth/updateuser", {
      email: profile.email,
      name: profile.name,
      homeAddress: profile.homeAddress,
    })
    .then(() => {
      setSuccess("Profile updated successfully.");
      setEditMode(false);
    })
    .catch(() => setError("Failed to update profile."));
  };

  const handleCancel = () => {
    setEditMode(false);
    setSuccess(null);
    setError(null);
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error && !editMode) return <Alert variant="danger" className="text-center mt-5">{error}</Alert>;

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <Card className="shadow-lg p-4 rounded-4 w-100" style={{ maxWidth: "500px" }}>
        <div className="text-center mb-3">
          <PersonFill size={64} style={{ color: '#6c757d' }} className="mb-2" />
          <h3 className="fw-bold">My Profile</h3>
          <Badge bg="dark" className="mt-1">{profile?.role}</Badge>
        </div>

        <hr />

        {success && <Alert variant="success">{success}</Alert>}
        {error && editMode && <Alert variant="danger">{error}</Alert>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label><PersonFill className="me-2 text-secondary" />Name</Form.Label>
            {editMode ? (
              <Form.Control
                type="text"
                name="name"
                value={profile.name || ""}
                onChange={handleChange}
                placeholder="Enter your name"
              />
            ) : (
              <div className="form-control bg-light text-muted">
                {profile.name || "NAME"}
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label><EnvelopeFill className="me-2 text-secondary" />Email</Form.Label>
            <div className="form-control bg-light text-muted">
              {profile.email}
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label><GeoAltFill className="me-2 text-secondary" />Delivery Address</Form.Label>
            {editMode ? (
              <Form.Control
                type="text"
                name="homeAddress"
                value={profile.homeAddress || ""}
                onChange={handleChange}
                placeholder="Enter your delivery address"
              />
            ) : (
              <div className="form-control bg-light text-muted">
                {profile.homeAddress || "ADDRESS"}
              </div>
            )}
          </Form.Group>

          <ButtonGroup className="d-flex">
            {editMode ? (
              <>
                <Button variant="dark" onClick={handleSave} className="flex-fill me-2">Save</Button>
                <Button variant="secondary" onClick={handleCancel} className="flex-fill">Cancel</Button>
              </>
            ) : (
              <Button variant="dark" onClick={() => setEditMode(true)} className="flex-fill">Edit Profile</Button>
            )}
          </ButtonGroup>
        </Form>
      </Card>
    </Container>
  );
};

export default Profile;
