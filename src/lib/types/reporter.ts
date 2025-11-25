import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'reporters' })
export class Reporter {
	@PrimaryColumn({ type: 'text' })
	id: string;

	@Column({ type: 'text', nullable: true })
	name?: string;

	@Column({ type: 'text', nullable: true })
	contact?: string;

	@Column({ type: 'jsonb', nullable: true })
	details?: Record<string, unknown>;

	constructor(id: string, name?: string, contact?: string, details?: Record<string, unknown>) {
		this.id = String(id);
		this.name = name;
		this.contact = contact;
		this.details = details;
	}
}

export default Reporter;
