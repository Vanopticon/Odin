import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Source } from './source';
import { Reporter } from './reporter';
import { Keyword } from './keyword';

@Entity({ name: 'sightings' })
export class Sighting {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@ManyToOne(() => Keyword, (k: Keyword) => k.sightings, { nullable: false })
	@JoinColumn({ name: 'keyword' })
	keyword: Keyword | string;

	@Column({ type: 'timestamptz' })
	timestamp: string;

	@Column({ type: 'jsonb', nullable: true })
	data: string | Record<string, unknown>;

	@ManyToOne(() => Source, { nullable: true })
	@JoinColumn({ name: 'source_id', referencedColumnName: 'id' })
	source?: Source;

	@ManyToOne(() => Reporter, { nullable: true })
	@JoinColumn({ name: 'reporter_id', referencedColumnName: 'id' })
	reporter?: Reporter;

	@Column({ type: 'jsonb', nullable: true })
	details?: Record<string, unknown>;

	constructor(
		keyword: string,
		timestamp?: string | Date,
		data?: string | Record<string, unknown>,
		source?: Source,
		reporter?: Reporter,
		details?: Record<string, unknown>
	) {
		this.keyword = keyword;
		this.timestamp = timestamp
			? timestamp instanceof Date
				? timestamp.toISOString()
				: String(timestamp)
			: new Date().toISOString();
		this.data = data ?? '';
		this.source = source;
		this.reporter = reporter;
		this.details = details;
	}
}

export default Sighting;
