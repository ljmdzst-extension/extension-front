import React from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CommonIconWithTooltip from './Icon/CommonIconWithTooltip';

interface YearSelectorProps {
	year: number;
	onYearChange: (newYear: number) => void;
}

const YearSelector: React.FC<YearSelectorProps> = ({ year, onYearChange }) => {
	const currentYear = new Date().getFullYear();
	const minYear = 2023;

	const handlePreviousYear = () => {
		if (year > minYear) {
			onYearChange(year - 1);
		}
	};

	const handleNextYear = () => {
		if (year < currentYear) {
			onYearChange(year + 1);
		}
	};

	return (
		<div className='d-flex align-items-center justify-content-center'>
			<CommonIconWithTooltip
				Icon={ChevronLeftIcon}
				onClick={handlePreviousYear}
				tooltipText='Año Anterior'
				style={{ marginRight: '0.5rem', fontSize: '40px' }}
			/>

			<span className='px-3'>{year}</span>

			<CommonIconWithTooltip
				Icon={ChevronRightIcon}
				onClick={handleNextYear}
				tooltipText='Año Siguiente'
				style={{ marginRight: '0.5rem', fontSize: '40px' }}
			/>
		</div>
	);
};

export default YearSelector;
