import React, { useCallback, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Swal from 'sweetalert2';
import { Row, Col, ToggleButtonGroup, ToggleButton, Table } from 'react-bootstrap';
import { ContentCopy, Edit, Delete, Save } from '@mui/icons-material';
import { textLimitError } from '@/utils/validacionesForms';
import { Actividad, Ubicacione } from '@/types/ActivityProps';
import { handleSearch } from '@/services/api/public/geoloc/geolocationService';

interface Props {
    activity: Actividad;
    saveData: (data: Partial<Actividad>) => void;
}


interface UbicacionPredefinida {
    descripcion: string;
    direccion: string;
    ciudad: string;
    provincia: string;
    departamento: string;
    pais: string;
    latitud: number;
    longitud: number;
}

const ubicacionesPredefinidas: UbicacionPredefinida[] = [
    {
        descripcion: 'FADU',
        direccion: 'Ruta Nacional 168',
        ciudad: 'Santa Fe',
        provincia: 'Santa Fe',
        departamento: 'La Capital',
        pais: 'Argentina',
        latitud: -31.640231204824136,
        longitud: -60.67352352275283,
    },
    {
        descripcion: 'FHUC',
        direccion: 'Ruta Nacional 168',
        ciudad: 'Santa Fe',
        provincia: 'Santa Fe',
        departamento: 'La Capital',
        pais: 'Argentina',
        latitud: -31.640318536239345,
        longitud: -60.67366288619337,
    },
    {
        descripcion: 'FICH',
        direccion: 'Ruta Nacional 168',
        ciudad: 'Santa Fe',
        provincia: 'Santa Fe',
        departamento: 'La Capital',
        pais: 'Argentina',
        latitud: -31.63990524713487,
        longitud: -60.67210683522049,
    },
    {
        descripcion: 'FBCB',
        direccion: 'Ruta Nacional 168',
        ciudad: 'Santa Fe',
        provincia: 'Santa Fe',
        departamento: 'La Capital',
        pais: 'Argentina',
        latitud: -31.639897918296633, 
        longitud: -60.67281315126916,
    },
    {
        descripcion: 'ISM',
        direccion: 'Ruta Nacional 168',
        ciudad: 'Santa Fe',
        provincia: 'Santa Fe',
        departamento: 'La Capital',
        pais: 'Argentina',
        latitud: -31.640350804771288, 
        longitud: -60.67408842134198,
    },
    {
        descripcion: 'FCM',
        direccion: 'Ruta Nacional 168',
        ciudad: 'Santa Fe',
        provincia: 'Santa Fe',
        departamento: 'La Capital',
        pais: 'Argentina',
        latitud: -31.639720282731595,
        longitud: -60.670574685948985,
    },
    {
        descripcion: 'FCJS',
        direccion: 'Candido Pujato 2751',
        ciudad: 'Santa Fe',
        provincia: 'Santa Fe',
        departamento: 'La Capital',
        pais: 'Argentina',
        latitud: -31.63435415364758, 
        longitud: -60.70505958802472
    }
];

// Función de validación de coordenadas (Latitud, Longitud)
const isValidCoordinates = (coord: string) => {
    const regex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (!regex.test(coord)) return false;

    const [lat, lng] = coord.split(',').map(Number);
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

// Copiar texto al portapapeles
const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

// Componente UbicacionesList para renderizar la tabla de ubicaciones
const UbicacionesList = ({
    ubicaciones,
    eliminarUbicacion,
}: {
    ubicaciones: Ubicacione[];
    eliminarUbicacion: (index: number) => void;
}) => (
    <div style={{ maxHeight: '220px', overflowY: 'auto' }} className='mt-3 custom-scrollbar'>
        <Table striped bordered hover responsive size='sm'>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Descripción</th>
                    <th>Tipo / Radio</th>
                    <th>Coordenadas / Mapa</th>
                    <th style={{ width: '60px' }}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {ubicaciones.length === 0 ? (
                    <tr>
                        <td colSpan={5} className='text-center text-muted py-3'>
                            No hay ubicaciones registradas para esta actividad.
                        </td>
                    </tr>
                ) : (
                    ubicaciones.map((item, index) => {
                        const hasCoords =
                            item.latitud !== undefined &&
                            item.longitud !== undefined &&
                            item.latitud !== null &&
                            item.longitud !== null;

                        const mapUrl =
                            item.enlace ||
                            (hasCoords
                                ? `https://www.google.com/maps?q=${item.latitud},${item.longitud}`
                                : '#');

                        const radioVal = Number(item.radio) || 0;

                        return (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.desc || 'Sin descripción'}</td>
                                <td>
                                    {radioVal > 0 ? (
                                        <span className='badge bg-info text-dark'>
                                            Circunferencia ({radioVal} m)
                                        </span>
                                    ) : (
                                        <span className='badge bg-secondary'>Punto exacto</span>
                                    )}
                                </td>
                                <td>
                                    {mapUrl !== '#' ? (
                                        <a href={mapUrl} target='_blank' rel='noopener noreferrer'>
                                            {item.ciudad ? `${item.direccion}, ${item.ciudad}, ${item.provincia}, ${item.departamento}` : 'Ver en Mapa'}
                                        </a>
                                    ) : (
                                        <span className='text-muted'>Sin coordenadas</span>
                                    )}
                                </td>
                                <td>
                                    <div className='d-flex align-items-center gap-2'>
                                        {mapUrl !== '#' && (
                                            <ContentCopy
                                                className='cursor-pointer text-primary'
                                                style={{ fontSize: 18, cursor: 'pointer' }}
                                                onClick={() => copyToClipboard(mapUrl)}
                                                titleAccess='Copiar enlace del mapa'
                                            />
                                        )}
                                        <Delete
                                            onClick={() => eliminarUbicacion(index)}
                                            style={{
                                                borderRadius: '20%',
                                                backgroundColor: 'red',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: 20,
                                            }}
                                            titleAccess='Eliminar ubicación'
                                        />
                                    </div>
                                </td>
                            </tr>
                        );
                    })
                )}
            </tbody>
        </Table>
    </div>
);

const FormDescriptionUbication: React.FC<Props> = ({ activity, saveData }) => {
    // Estado de la descripción general de la actividad
    const [editandoDescripcion, setEditandoDescripcion] = useState(false);
    const [descripcion, setDescripcion] = useState<string>(activity.desc ?? '');

    // Lista de ubicaciones
    const [ubicaciones, setUbicaciones] = useState<Ubicacione[]>(activity.listaUbicaciones ?? []);

    // Campos del formulario de alta de ubicación
    const [ubicacionDescripcion, setUbicacionDescripcion] = useState<string>('');
    const [modoUbicacion, setModoUbicacion] = useState<'direccion' | 'coordenadas'>('direccion');
    const [tipoForma, setTipoForma] = useState<'punto' | 'circunferencia'>('punto');
    const [radio, setRadio] = useState<string>('0');
    const [crearUbicacion, setCrearUbicacion] = useState<boolean>(false);

    // Campos modo dirección
    const [direccion, setDireccion] = useState<string>('');
    const [ciudad, setCiudad] = useState<string>('Santa Fe');
    const [provincia, setProvincia] = useState<string>('Santa Fe');
    const [departamento, setDepartamento] = useState<string>('La Capital');

    // Campos modo coordenadas
    const [coordenadas, setCoordenadas] = useState<string>('');

    // Estado de carga para la geocodificación
    const [buscando, setBuscando] = useState<boolean>(false);

    // Efecto para sincronizar con la actividad padre
    useEffect(() => {
        if (!editandoDescripcion) {
            saveData({ desc: descripcion, listaUbicaciones: ubicaciones });
        }
    }, [editandoDescripcion, descripcion, ubicaciones]);

    const handleEditDescripcionToggle = () => {
        if (editandoDescripcion && textLimitError(descripcion, 2000)) return;
        setEditandoDescripcion(!editandoDescripcion);
    };

    const resetFormUbicacion = () => {
        setUbicacionDescripcion('');
        setDireccion('');
        setCiudad('Santa Fe');
        setProvincia('Santa Fe');
        setDepartamento('La Capital');
        setCoordenadas('');
        setRadio('0');
        setTipoForma('punto');
    };

    const seleccionarUbicacionPredefinida = (
    ubicacion: UbicacionPredefinida
    ) => {
        setUbicacionDescripcion(ubicacion.descripcion);
        setDireccion(ubicacion.direccion);
        setCiudad(ubicacion.ciudad);
        setProvincia(ubicacion.provincia);
        setDepartamento(ubicacion.departamento);

        setCoordenadas(
            `${ubicacion.latitud}, ${ubicacion.longitud}`
        );

        const nuevaUbicacion: Ubicacione = {
                idUbicacion: 0,
                desc: ubicacion.descripcion,
                enlace: `https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}`,
                direccion: ubicacion.direccion,
                ciudad: ubicacion.ciudad,
                provincia: ubicacion.provincia,
                departamento: ubicacion.departamento,
                latitud: String(ubicacion.latitud),
                longitud: String(ubicacion.longitud),
                radio: tipoForma === 'circunferencia' ? parseFloat(radio) : 0,
            };

        setUbicaciones((prev) => [...prev, nuevaUbicacion]);

        resetFormUbicacion();
        setCrearUbicacion(false);
    };

    // Función para agregar la nueva ubicación
    const agregarUbicacion = async () => {
        if (!ubicacionDescripcion.trim()) {
            Swal.fire({
                title: 'Error',
                text: 'Debe ingresar una descripción para la ubicación.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
            });
            return;
        }

        const radioValue = tipoForma === 'circunferencia' ? parseFloat(radio) : 0;
        if (tipoForma === 'circunferencia' && (isNaN(radioValue) || radioValue <= 0)) {
            Swal.fire({
                title: 'Error',
                text: 'Para una circunferencia, debe ingresar un radio válido mayor a 0 metros.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
            });
            return;
        }

        setBuscando(true);

        let finalLat: string | undefined = undefined;
        let finalLng: string | undefined = undefined;
        let finalEnlace = '';

        if (modoUbicacion === 'direccion') {
            if (!direccion.trim() || !ciudad.trim() || !provincia.trim() || !departamento.trim()) {
                Swal.fire({
                    title: 'Error',
                    text: 'Complete todos los campos de la dirección postal.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                });
                setBuscando(false);
                return;
            }

            const result = await handleSearch({
                direccion: direccion,
                ciudad: ciudad,
                provincia: provincia,
                departamento: departamento,
                pais: 'Argentina'
            });

            if (result) {
                finalLat = result.latitud;
                finalLng = result.longitud;
                finalEnlace = `https://www.google.com/maps?q=${finalLat},${finalLng}`;
            } else {
                Swal.fire({
                    title: 'Error de ubicación',
                    text: 'No se encontraron coordenadas para la dirección ingresada. Verifique la dirección o ingrese coordenadas manualmente.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                });
                setBuscando(false);
                return;
            }
        } else {
            // Modo Coordenadas GPS
            if (!isValidCoordinates(coordenadas)) {
                Swal.fire({
                    title: 'Error',
                    text: 'Las coordenadas ingresadas no son válidas. Formato requerido: "latitud, longitud".',
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                });
                setBuscando(false);
                return;
            }

            const [latStr, lngStr] = coordenadas.split(',').map((c) => c.trim());
            finalLat = parseFloat(latStr);
            finalLng = parseFloat(lngStr);
            finalEnlace = `https://www.google.com/maps?q=${finalLat},${finalLng}`;
        }

        const nuevaUbicacion: Ubicacione = {
            idUbicacion: 0,
            desc: ubicacionDescripcion.trim(),
            enlace: finalEnlace,
            direccion: modoUbicacion === 'direccion' ? direccion : '',
            ciudad: modoUbicacion === 'direccion' ? ciudad : '',
            provincia: modoUbicacion === 'direccion' ? provincia : '',
            departamento: modoUbicacion === 'direccion' ? departamento : '',
            latitud: String(finalLat),
            longitud: String(finalLng),
            radio: radioValue,
        };

        setUbicaciones((prev) => [...prev, nuevaUbicacion]);
        resetFormUbicacion();
        setBuscando(false);
        setCrearUbicacion(false);
    };

    const eliminarUbicacion = useCallback((index: number) => {
        setUbicaciones((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const mostrarAlertaAyudaCoordenadas = useCallback(() => {
        Swal.fire({
            title: '¿Cómo obtener coordenadas de Google Maps?',
            html: `
                <p className="text-start">
                    1. Ve a <strong>Google Maps</strong> y busca el punto deseado.<br/>
                    2. Haz clic derecho sobre el punto en el mapa.<br/>
                    3. Haz clic en las coordenadas que aparecen al inicio del menú desplegable para copiarlas al portapapeles.<br/>
                    4. Pégalas directamente en el campo <strong>"Latitud, Longitud"</strong>.
                </p>`,
            confirmButtonText: 'Cerrar',
            width: '600px',
        });
    }, []);

    return (
        <>
            {/* Sección Descripción General */}
            <div className='mb-4'>
                <h5>Descripción de la Actividad:</h5>
                <InputGroup className='gap-1'>
                    <Form.Control
                        as='textarea'
                        rows={3}
                        style={{ resize: 'none' }}
                        className='custom-scrollbar'
                        aria-label='Inserte descripción'
                        disabled={!editandoDescripcion}
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        isInvalid={textLimitError(descripcion, 2000)}
                    />
                    <Form.Control.Feedback type='invalid' tooltip>
                        Máximo 2000 caracteres
                    </Form.Control.Feedback>
                    <Button variant='secondary' onClick={handleEditDescripcionToggle}>
                        {editandoDescripcion ? <Save /> : <Edit />}
                    </Button>
                </InputGroup>
            </div>


            <Button
                variant='primary'
                onClick={() => setCrearUbicacion(!crearUbicacion)}
                className='mb-3'
            >
                {crearUbicacion ? 'Cancelar' : 'Agregar Nueva Ubicación'}
            </Button>
            {crearUbicacion && (<>

                {/* Sección Agregar Ubicación */}
                <div className='border rounded p-3 bg-light mb-3'>

                    {/* 1. Descripción de la Ubicación */}
                    <Row className='mb-3'>
                        <Col md={12}>
                            <Form.Group controlId='ubicacionDescripcion'>
                                <Form.Label>
                                    <strong>Descripción del Lugar / Punto</strong>
                                </Form.Label>
                                <Form.Control
                                    type='text'
                                    placeholder='Ubicación de la actividad'
                                    value={ubicacionDescripcion}
                                    onChange={(e) => setUbicacionDescripcion(e.target.value)}
                                />
                                <div className='mt-2'>
                                    <Form.Label className='text-muted mb-1'>
                                        <small>Autocompletado directo de ubicaciones</small>
                                    </Form.Label>

                                    <div className='d-flex flex-wrap gap-2'>
                                        {ubicacionesPredefinidas.map((ubicacion) => (
                                            <Button
                                                key={ubicacion.descripcion}
                                                variant='outline-primary'
                                                size='sm'
                                                onClick={() =>
                                                    seleccionarUbicacionPredefinida(ubicacion)
                                                }
                                            >
                                                {ubicacion.descripcion}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* 2. Selección Tipo de Geometría (Punto vs Circunferencia) */}
                    <Row className='mb-3 align-items-end'>
                        <Col md={6}>
                            <Form.Label className='d-block text-muted mb-2'>Tipo de Cobertura</Form.Label>
                            <ToggleButtonGroup
                                type='radio'
                                name='tipoForma'
                                value={tipoForma}
                                onChange={(val) => {
                                    setTipoForma(val);
                                    if (val === 'punto') setRadio('0');
                                }}
                                className='w-100'
                            >
                                <ToggleButton id='tbtn-forma-punto' value={'punto'} variant='outline-secondary'>
                                    Punto Único
                                </ToggleButton>
                                <ToggleButton id='tbtn-forma-circ' value={'circunferencia'} variant='outline-secondary'>
                                    Circunferencia / Área
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Col>

                        {tipoForma === 'circunferencia' && (
                            <Col md={6}>
                                <Form.Group controlId='radioUbicacion'>
                                    <Form.Label>Radio de cobertura (metros)</Form.Label>
                                    <Form.Control
                                        type='number'
                                        min='1'
                                        placeholder='Ej: 500'
                                        value={radio}
                                        onChange={(e) => setRadio(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        )}
                    </Row>

                    {/* 3. Selector de Modo de ingreso (Dirección vs Coordenadas) */}
                    <Row className='mb-3'>
                        <Col md={12}>
                            <Form.Label className='d-block text-muted mb-2'>
                                ¿Cómo deseas definir las coordenadas?
                            </Form.Label>
                            <ToggleButtonGroup
                                type='radio'
                                name='modoUbicacion'
                                value={modoUbicacion}
                                onChange={(val) => setModoUbicacion(val)}
                                className='w-100'
                            >
                                <ToggleButton id='tbtn-dir-ub' value={'direccion'} variant='outline-primary'>
                                    Dirección Postal (Geocodificación)
                                </ToggleButton>
                                <ToggleButton id='tbtn-geo-ub' value={'coordenadas'} variant='outline-primary'>
                                    Coordenadas Directas (Lat / Lng)
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Col>
                    </Row>

                    {/* MODO 1: DIRECCIÓN POSTAL */}
                    {modoUbicacion === 'direccion' && (
                        <>
                            <Row className='g-3 mb-3'>
                                <Col md={6}>
                                    <Form.Group controlId='dirCalle'>
                                        <Form.Label>Dirección (Calle y número)</Form.Label>
                                        <Form.Control
                                            type='text'
                                            placeholder='Ej: San Martín 3234'
                                            value={direccion}
                                            onChange={(e) => setDireccion(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId='dirCiudad'>
                                        <Form.Label>Ciudad / Localidad</Form.Label>
                                        <Form.Control
                                            type='text'
                                            placeholder='Ej: Santa Fe'
                                            value={ciudad}
                                            onChange={(e) => setCiudad(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className='g-3 mb-3'>
                                <Col md={6}>
                                    <Form.Group controlId='dirProvincia'>
                                        <Form.Label>Provincia / Estado</Form.Label>
                                        <Form.Control
                                            type='text'
                                            placeholder='Ej: Santa Fe'
                                            value={provincia}
                                            onChange={(e) => setProvincia(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId='departamento'>
                                        <Form.Label>Departamento</Form.Label>
                                        <Form.Control
                                            type='text'
                                            placeholder='Ej: La Capital'
                                            value={departamento}
                                            onChange={(e) => setDepartamento(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}

                    {/* MODO 2: COORDENADAS GPS */}
                    {modoUbicacion === 'coordenadas' && (
                        <Row className='g-3 mb-3'>
                            <div className='d-flex justify-content-between align-items-center mb-3'>
                        <Button variant='info' size='sm' onClick={mostrarAlertaAyudaCoordenadas}>
                            ¿Cómo obtener coordenadas?
                        </Button>
                    </div>
                            <Col md={12}>
                                <Form.Group controlId='coordsGps'>
                                    <Form.Label>Latitud, Longitud</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Ej: -31.646366, -60.706766'
                                        value={coordenadas}
                                        onChange={(e) => setCoordenadas(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    )}

                    {/* Botón para procesar y agregar ubicación */}
                    <Row className='mt-3'>
                        <Col md={12}>
                            <Button
                                variant='success'
                                onClick={agregarUbicacion}
                                disabled={
                                    buscando ||
                                    !ubicacionDescripcion.trim() ||
                                    (modoUbicacion === 'direccion' && (!direccion || !ciudad || !provincia || !departamento)) ||
                                    (modoUbicacion === 'coordenadas' && !coordenadas)
                                }
                                className='w-100 py-2 fw-bold'
                            >
                                {buscando ? 'Buscando Coordenadas...' : 'Agregar Ubicación'}
                            </Button>
                        </Col>
                    </Row>
                </div>

            </>
        )}



        {!crearUbicacion && (
            <>
                <h3 className='mb-3'>Lista de Ubicaciones</h3>
                <UbicacionesList ubicaciones={ubicaciones} eliminarUbicacion={eliminarUbicacion} />
            </>
        )}

        </>
    );
};

export default FormDescriptionUbication;