import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Form } from 'react-bootstrap';

interface FormInputProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label?: string;
	type?: string;
	rules?: Record<string, any>;
	disabled?: boolean;
}

const FormInput = <T extends FieldValues>({
	control,
	name,
	label,
	type = 'text',
	rules = {},
	disabled = false,
}: FormInputProps<T>) => (
	<Form.Group controlId={`form${name}`} className='mb-2'>
		{label && <Form.Label>{label}</Form.Label>}
		<Controller
			name={name}
			control={control}
			rules={rules}
			render={({ field, fieldState: { error } }) => (
				<>
					<Form.Control {...field} size='sm' type={type} isInvalid={!!error} disabled={disabled} />
					{error && <Form.Control.Feedback type='invalid'>{error.message}</Form.Control.Feedback>}
				</>
			)}
		/>
	</Form.Group>
);

export default FormInput;
