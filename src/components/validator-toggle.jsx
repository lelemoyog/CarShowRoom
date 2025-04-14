import vhtml from 'vhtml';

/** @jsx vhtml */

export function ValidatorToggle({ issues, reportError }) {
	let levelClassName = '';
	let message = '';

	
	return (
		<div className={`report-toggle ${levelClassName}`}>
			<div class="report-toggle-text">{message}</div>
			
		</div>
	);
}
