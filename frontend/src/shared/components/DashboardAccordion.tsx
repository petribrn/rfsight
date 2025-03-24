import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';

interface IAccordionProps {
  id: string;
  title: string;
  defaultExpanded: boolean;
  children: ReactNode;
}

export const DashboardAccordion = ({
  id,
  title,
  defaultExpanded,
  children,
}: IAccordionProps) => {
  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon />}
        aria-controls={`header-${id}`}
        id={id}
      >
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};
