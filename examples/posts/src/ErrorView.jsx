import PropTypes from "prop-types";

const propTypes = {
  error: PropTypes.instanceOf(Error).isRequired,
};

/** @param {import('prop-types').InferProps<propTypes>} props */
export default function ErrorView({ error }) {
  return <pre>{String(error?.stack || error)}</pre>;
}

ErrorView.propTypes = propTypes;
