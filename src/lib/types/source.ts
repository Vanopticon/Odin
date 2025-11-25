import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'sources' })
export class Source {
	@PrimaryColumn({ type: 'text' })
	id: string;

	@Column({ type: 'text', nullable: true })
	name?: string;

	@Column({ type: 'text', nullable: true })
	type?: string;

	@Column({ type: 'jsonb', nullable: true })
	meta?: Record<string, unknown>;

	constructor(id: string, name?: string, type?: string, meta?: Record<string, unknown>) {
		this.id = String(id);
		this.name = name;
		this.type = type;
		this.meta = meta;
	}

	toJSON() {
		return { id: this.id, name: this.name, type: this.type, meta: this.meta };
	}

	static from(
		obj: string | { id: string; name?: string; type?: string; meta?: Record<string, unknown> }
	) {
		if (typeof obj === 'string') return new Source(obj);
		return new Source(obj.id, obj.name, obj.type, obj.meta);
	}
}

export default Source;
