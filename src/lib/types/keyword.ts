import {
	Entity,
	PrimaryColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { Sighting } from './sighting';
import { Language } from './language';

@Entity({ name: 'keywords' })
export class Keyword {
	@PrimaryColumn({ type: 'text' })
	keyword: string;

	@ManyToOne(() => Language, { nullable: true })
	@JoinColumn({ name: 'language_code', referencedColumnName: 'code' })
	language?: Language;

	@CreateDateColumn({ type: 'timestamptz' })
	addedAt: string;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: string;

	@OneToMany(() => Sighting, (s: Sighting) => s.keyword, { cascade: true })
	sightings: Sighting[] = [];

	constructor(value: string, languageCode?: string | Language, addedAt?: string) {
		const now = new Date().toISOString();
		this.keyword = value;
		if (languageCode) {
			if (typeof languageCode === 'string') {
				// best-effort: create a Language placeholder (name optional)
				this.language = new Language(String(languageCode).trim().toLowerCase(), '');
			} else {
				this.language = languageCode;
			}
		}
		this.addedAt = addedAt ?? now;
		this.updatedAt = this.addedAt;
	}

	/** Record a new sighting for this keyword and return it */
	recordSighting(
		data?: string | Record<string, unknown>,
		source?: string | import('./source').Source,
		reporter?: string | import('./reporter').Reporter,
		details?: Record<string, unknown>,
		timestamp?: string | Date
	) {
		const s = new Sighting(this.keyword, timestamp, data, source as any, reporter as any, details);
		this.sightings.push(s);
		this.updatedAt = new Date().toISOString();
		return s;
	}

	/** Return a copy of sightings */
	listSightings() {
		return this.sightings.slice();
	}

	/** Update the keyword text and refresh `updatedAt` */
	update(newValue: string) {
		if (this.keyword === newValue) return this;
		this.keyword = newValue;
		this.updatedAt = new Date().toISOString();
		return this;
	}

	/** Manually touch the `updatedAt` timestamp */
	touch() {
		this.updatedAt = new Date().toISOString();
		return this;
	}
}

export default Keyword;
