import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'languages' })
export class Language {
	@PrimaryColumn({ type: 'varchar', length: 3 })
	code: string;

	@Column({ type: 'text' })
	name: string;

	constructor(code: string, name: string) {
		const normalized = String(code || '')
			.trim()
			.toLowerCase();
		if (!/^[a-z]{3}$/.test(normalized)) {
			throw new Error('Language code must be three ASCII letters');
		}
		this.code = normalized;
		this.name = String(name || '').trim();
	}

	/** Update the language name */
	updateName(newName: string) {
		this.name = String(newName || '').trim();
		return this;
	}

	/** Case-insensitive equality by code */
	equals(other: Language | string) {
		const otherCode = typeof other === 'string' ? other : other.code;
		return this.code === String(otherCode).trim().toLowerCase();
	}
}

export default Language;
