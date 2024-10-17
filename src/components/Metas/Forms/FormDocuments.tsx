import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import { Form } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import DeleteIcon from '@mui/icons-material/Delete';
import { Actividad, Enlace } from '@/types/ActivityProps';

interface Props {
	activity: Actividad;
	saveData: (data: Partial<Actividad>) => void;
}

export default function FormOrgInst({ activity, saveData }: Props) {
	const [arrayDocumentos, setArrayDocumentos] = useState<Enlace[]>(activity.listaEnlaces || []);
	const [descripcion, setDescripcion] = useState('');
	const [nombreArchivo, setNombreArchivo] = useState('');

	useEffect(() => {
		saveData({ listaEnlaces: arrayDocumentos });
	}, [arrayDocumentos]);

	const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (descripcion && nombreArchivo) {
			setArrayDocumentos([
				...arrayDocumentos,
				{
					idEnlace: 0,
					link: nombreArchivo,
					desc: descripcion,
				} as Enlace,
			]);

			setDescripcion('');
			setNombreArchivo('');
		}
	};

	const eliminarDocumento = (id: number, index: number) => {
		const documentosFiltrados = arrayDocumentos.filter(
			(item, i) => i !== index || item.idEnlace !== id,
		);
		setArrayDocumentos(documentosFiltrados);
	};

	const isUrlValid = (url: string) => {
		const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
		return urlPattern.test(url);
	};

	return (
		<>
			<p>Cargue sus enlaces:</p>
			<Form className=' d-flex flex-column justify-content-center' onSubmit={submitForm}>
				<div className=' d-flex gap-2 justify-content-center'>
					<Form.Control
						type='text'
						name='descripcion'
						value={descripcion}
						placeholder='Ingrese una descripción'
						onChange={(e) => setDescripcion(e.target.value)}
					/>

					<Form.Control
						type='text'
						name='ubicacion'
						placeholder='Enlace'
						value={nombreArchivo}
						onChange={(e) => setNombreArchivo(e.target.value)}
						isInvalid={nombreArchivo !== '' && !isUrlValid(nombreArchivo)}
					/>
				</div>
				<Button
					variant='success'
					className='mx-auto mt-2 '
					type='submit'
					disabled={nombreArchivo === '' || !isUrlValid(nombreArchivo)}
				>
					Agregar
				</Button>
			</Form>
			<div
				className=' custom-scrollbar '
				style={{ height: '15rem', maxHeight: '15rem', overflowY: 'auto' }}
			>
				<Table>
					<thead style={{ position: 'sticky', top: '0' }}>
						<tr>
							<th>Descripción</th>
							<th>Enlace</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{arrayDocumentos.map((item, index) => (
							<tr key={index}>
								<td style={{ width: '25%' }}>{item.desc}</td>
								<td
									style={{
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
										maxWidth: '200px',
									}}
								>
									<a href={item.link ?? ''} target='_blank' rel='noopener noreferrer'>
										{item.link}
									</a>
								</td>
								<td style={{ width: '5%' }}>
									<DeleteIcon
										color='error'
										onClick={() => eliminarDocumento(item.idEnlace ?? 0, index)}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</div>
		</>
	);
}
