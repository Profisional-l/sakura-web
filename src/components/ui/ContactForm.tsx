"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { submitContactForm } from "@/actions";
import { EASE_SAKURA } from "@/lib/motion";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("loading");
    setErrors({});

    const result = await submitContactForm(new FormData(form));

    if (result.success) {
      setStatus("success");
      form.reset();
    } else {
      setStatus("error");
      setErrors(result.errors ?? {});
    }
  }

  return (
    <form onSubmit={handleSubmit} className="sakura-form">
      <FormField name="name" label="Name" errors={errors.name} />
      <FormField name="email" label="Email" type="email" errors={errors.email} />
      <FormField name="company" label="Company (optional)" errors={errors.company} />

      <div className="sakura-form-field">
        <label className="sakura-label" htmlFor="message">
          Message
        </label>
        <textarea id="message" name="message" rows={5} required className="sakura-input" />
        {errors.message && <p className="sakura-error">{errors.message[0]}</p>}
      </div>

      <motion.button
        type="submit"
        disabled={status === "loading"}
        className="sakura-submit"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.25, ease: EASE_SAKURA }}
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </motion.button>

      <AnimatePresence mode="wait">
        {status === "success" && (
          <motion.p
            key="success"
            className="sakura-form-success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_SAKURA }}
          >
            Message sent. We&apos;ll be in touch soon.
          </motion.p>
        )}
        {status === "error" && !Object.keys(errors).length && (
          <motion.p
            key="error"
            className="sakura-error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_SAKURA }}
          >
            Something went wrong. Please try again.
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

function FormField({
  name,
  label,
  type = "text",
  errors,
}: {
  name: string;
  label: string;
  type?: string;
  errors?: string[];
}) {
  return (
    <div className="sakura-form-field">
      <label className="sakura-label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={name !== "company"}
        className="sakura-input"
      />
      {errors && <p className="sakura-error">{errors[0]}</p>}
    </div>
  );
}
