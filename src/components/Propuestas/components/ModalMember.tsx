import { useEffect, useState } from 'react';
import { Form, FormSelect, Modal } from 'react-bootstrap';
import { IntegranteEquipoProps } from '@/types/ProjectsProps';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

const animatedComponents = makeAnimated();

interface ModalMemberProps {
	show: boolean;
	handleClose: () => void;
	memberList: IntegranteEquipoProps[];
	handleRoles: (memberList: IntegranteEquipoProps[]) => void;
}

interface selectOptions {
	label: string;
	value: string;
}

interface importanRolesProps {
	director: string | null;
	coDirector: string | null;
	coordinador: string | null;
	respFinanciero: string | null;
	Especialista: string[] | null;
}

export const ModalMember = ({ show, handleClose, memberList, handleRoles }: ModalMemberProps) => {
	const [importanRoles, setImportanRoles] = useState<importanRolesProps>({
		director: null,
		coDirector: null,
		coordinador: null,
		respFinanciero: null,
		Especialista: null,
	});

	const assignRoles = (member: IntegranteEquipoProps, role: string, dniRole: string | null) => {
		// Si el dni del rol coincide con el dni del miembro y el miembro no tiene ese rol, lo agregamos
		if (member.dni === dniRole && !member.lrol?.includes(role)) {
			return { ...member, lrol: [...(member.lrol ?? []), role] };
		}
		// Si el miembro no tiene la propiedad lrol, la creamos
		if (!member.lrol) {
			return { ...member, lrol: [] };
		}
		return member;
	};

	useEffect(() => {
		console.log(' memberList:  t');
		const addRolesToMembers = () => {
			if (memberList.length > 0) {
				const updatedMembers = memberList.map((member) => {
					member = assignRoles(member, 'Director', importanRoles.director);
					member = assignRoles(member, 'Co-Director', importanRoles.coDirector);
					member = assignRoles(member, 'Coordinador', importanRoles.coordinador);
					member = assignRoles(member, 'Responsable Financiero', importanRoles.respFinanciero);
					if (
						importanRoles.Especialista?.includes(member.dni) &&
						!member.lrol?.includes('Especialista')
					) {
						member = { ...member, lrol: [...(member.lrol ?? []), 'Especialista'] };
					}
					console.log(' memberList: ', member);
					return member;
				});
				handleRoles(updatedMembers);
			}
		};

		addRolesToMembers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [importanRoles]);

	return (
		<Modal show={show} onHide={handleClose} size='lg' centered>
			<Modal.Header closeButton>
				<Modal.Title>Modal heading</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group>
						<Form.Label>Director</Form.Label>
						<FormSelect
							aria-label='Default select example'
							name='director'
							value={importanRoles.director ?? ''}
							onChange={(e) => setImportanRoles({ ...importanRoles, director: e.target.value })}
						>
							<option>Seleccione un director</option>
							{memberList.length > 0 &&
								memberList?.map((member: IntegranteEquipoProps) => (
									<option key={member.dni} value={member.dni}>
										{member.nom}
									</option>
								))}
						</FormSelect>
					</Form.Group>
					<Form.Group>
						<Form.Label>Co-Director</Form.Label>
						<FormSelect
							aria-label='Default select example'
							name='coDirector'
							value={importanRoles.coDirector ?? ''}
							onChange={(e) => setImportanRoles({ ...importanRoles, coDirector: e.target.value })}
						>
							<option>Seleccione un Co-Director</option>
							{memberList.length > 0 &&
								memberList?.map((member: IntegranteEquipoProps) => (
									<option key={member.dni} value={member.dni}>
										{member.nom}
									</option>
								))}
						</FormSelect>
					</Form.Group>
					<Form.Group>
						<Form.Label>Coordinador</Form.Label>
						<FormSelect
							aria-label='Default select example'
							name='coordinador'
							value={importanRoles.coordinador ?? ''}
							onChange={(e) => setImportanRoles({ ...importanRoles, coordinador: e.target.value })}
						>
							<option>Seleccione un Coordinador</option>
							{memberList.length > 0 &&
								memberList?.map((member: IntegranteEquipoProps) => (
									<option key={member.dni} value={member.dni}>
										{member.nom}
									</option>
								))}
						</FormSelect>
					</Form.Group>
					<Form.Group>
						<Form.Label>Responsable Financiero</Form.Label>
						<FormSelect
							aria-label='Default select example'
							name='respFinanciero'
							value={importanRoles.respFinanciero ?? ''}
							onChange={(e) =>
								setImportanRoles({ ...importanRoles, respFinanciero: e.target.value })
							}
						>
							<option>Seleccione un Responsable Financiero</option>
							{memberList.length > 0 &&
								memberList?.map((member: IntegranteEquipoProps) => (
									<option key={member.dni} value={member.dni}>
										{member.nom}
									</option>
								))}
						</FormSelect>
					</Form.Group>
					<Form.Group>
						<Form.Label>Especialistas</Form.Label>
						<Select
							isMulti
							closeMenuOnSelect={false}
							components={animatedComponents}
							onChange={(selectedOptions) => {
								const selectedValues = selectedOptions.map((option: selectOptions) => option.value);
								setImportanRoles({ ...importanRoles, Especialista: selectedValues });
							}}
							options={memberList.map((member) => ({
								label: `${member.nom} ${member.ape}`,
								value: member.dni,
							}))}
							placeholder='Seleccione un Especialista'
							value={
								importanRoles.Especialista?.map((dni) => ({
									label: `${memberList.find((member) => member.dni === dni)?.nom} ${
										memberList.find((member) => member.dni === dni)?.ape
									}`,
									value: dni,
								})) ?? []
							}
						/>
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<button className='btn btn-secondary' onClick={handleClose}>
					Cerrar
				</button>
				<button className='btn btn-primary-custom' onClick={handleClose}>
					Guardar
				</button>
			</Modal.Footer>
		</Modal>
	);
};
