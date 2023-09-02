import React from "react";
import { useState } from "react";
import PlanificationPanel from "../components/PlanificationPanel";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
type IState = {
  myArray: string[];
};

export default function Activity() {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [term, setTerm] = useState("");
  const [nameActivity, setNameActivity] = useState("");
  const [nameActivityAux, setNameActivityAux] = useState("");
  const handleClose = () => setShow(false);
  const handleClose2 = () => setShow2(false);
  const handleShow = () => setShow(true);
  const handleShow2 = () => {
    setShow2(true);
  };
  const [arrayActivity, setArrayActivity] = useState<IState>({
    myArray: ["actividad 1", "actividad 2"],
  });
  const [isPlanificationOpen, setIsPlanificationOpen] = useState(false);
  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setArrayActivity({ myArray: [...arrayActivity.myArray, term] });
    handleClose();
    setTerm("");
  };
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Actividad</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={submitForm}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Nombre de la Actividad:</Form.Label>
              <Form.Control
                type="nombre"
                placeholder="nombre"
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </Form.Group>
            <Button variant="success" type="submit">
              Guardar
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={show2} onHide={handleClose2} name={nameActivityAux}>
        <Modal.Header closeButton>
          <Modal.Title>¿Quieres salir de la Actividad?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>
                Usted tiene una actividad en curso, ¿desea salir de la
                actividad?
              </Form.Label>
              <Form.Label>Los cambios no guardados se perderan.</Form.Label>
            </Form.Group>
            <Form.Group
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <Button variant="danger" onClick={handleClose2}>
                Cancelar
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  setIsPlanificationOpen(!isPlanificationOpen);
                  handleClose2();
                }}
              >
                Salir de la actividad
              </Button>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
      {isPlanificationOpen && (
        <div className="MenuOptionsAux">  
          <div className="Options">Carga de Presupuesto</div>
          <div className="Options">Ver Resumen y Graficos</div>
        </div>
      )}
      <div className="ConteinerActivity">
        <div className="MenuActivity">
          {arrayActivity.myArray.map((item, index) => (
            <ListGroup.Item
              action
              variant="secondary"
              style={{
                width: "300px",
                height: "50px",
                padding: "10px",
                borderRadius: "10px",
                display:"flex",
                justifyContent:"center",
              }}
              key={index}
              onClick={() => {
                if (isPlanificationOpen === true) {
                  handleShow2();
                  setNameActivityAux(item);
                } else {
                  setIsPlanificationOpen(!isPlanificationOpen);
                  setNameActivity(item);
                }
              }}
            >
              {item}
            </ListGroup.Item>
          ))}
          <Button variant="outline-success" className="Options" onClick={handleShow}>
            Agregar Actividad
          </Button>
        </div>
        {!isPlanificationOpen && (
          <div className="MenuOptions">
            <div className="Options">Carga de Presupuesto</div>
            <div className="Options">Ver Resumen y Graficos</div>
          </div>
        )}
        {isPlanificationOpen && <PlanificationPanel name={nameActivity} />}
      </div>
    </>
  );
}
