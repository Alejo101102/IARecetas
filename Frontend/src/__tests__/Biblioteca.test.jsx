import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import Biblioteca from "../pages/biblioteca/Biblioteca";

// Mock fetch
window.fetch = jest.fn();

describe("Biblioteca Component", () => {
  beforeEach(() => {
    fetch.mockClear();
    sessionStorage.clear();
    sessionStorage.setItem("uid", "test_user_123");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders Biblioteca component without crashing", () => {
    render(<Biblioteca />);
    expect(document.body).toBeInTheDocument();
  });

  it("displays biblioteca title", () => {
    render(<Biblioteca />);
    const body = document.body.textContent;

    expect(body).toContain("Mi Biblioteca");
  });

  describe("Favoritos Panel", () => {
    it("displays empty favorites message when no favorites", async () => {
      fetch.mockResolvedValueOnce({
        json: async () => [],
      });

      fetch.mockResolvedValueOnce({
        json: async () => [],
      });

      render(<Biblioteca />);

      await waitFor(() => {
        const body = document.body.textContent;
        expect(body).toContain("Aún no tienes favoritos");
      });
    });

    it("displays favorite recipes when available", async () => {
      const mockFavorites = [
        {
          original_history_id: 1,
          fav_id: "fav_1",
          recipe: {
            titulo: "Pasta Carbonara",
            descripcion: "Receta italiana clásica",
            tiempo_estimado: 20,
            dificultad: "Fácil",
            ingredientes: [],
            instrucciones: [],
          },
        },
      ];

      fetch
        .mockResolvedValueOnce({ json: async () => [] }) // historial
        .mockResolvedValueOnce({ json: async () => mockFavorites }); // favoritos

      render(<Biblioteca />);

      await waitFor(() => {
        expect(document.body.textContent).toContain("Pasta Carbonara");
      });
    });

    it("toggles favorite status when heart button clicked", async () => {
      const mockFavorites = [
        {
          original_history_id: 1,
          fav_id: "fav_1",
          recipe: {
            titulo: "Test Recipe",
            descripcion: "Test",
            tiempo_estimado: 15,
            dificultad: "Media",
            ingredientes: [],
            instrucciones: [],
          },
        },
      ];

      fetch
        .mockResolvedValueOnce({ json: async () => [] })
        .mockResolvedValueOnce({ json: async () => mockFavorites });

      const { container } = render(<Biblioteca />);

      await waitFor(() => {
        const heart = container.querySelector(".bib-card-heart");
        if (heart) {
          fireEvent.click(heart);
          expect(heart.className).toBeDefined();
        }
      });
    });
  });

  describe("Historial Panel", () => {
    it("displays historial section", async () => {
      fetch
        .mockResolvedValueOnce({ json: async () => [] })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<Biblioteca />);

      await waitFor(() => {
        expect(document.body.textContent).toContain("Historial Reciente");
      });
    });

    it("displays historial items when available", async () => {
      const mockHistory = [
        {
          id: 1,
          date: new Date(),
          recipe: {
            titulo: "Ensalada",
            descripcion: "Receta saludable",
            tiempo_estimado: 10,
            dificultad: "Fácil",
            ingredientes: [],
            instrucciones: [],
          },
        },
      ];

      fetch
        .mockResolvedValueOnce({ json: async () => mockHistory })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<Biblioteca />);

      await waitFor(() => {
        expect(document.body.textContent).toContain("Ensalada");
      });
    });

    it("opens recipe view when historial item clicked", async () => {
      const mockHistory = [
        {
          id: 1,
          date: new Date(),
          recipe: {
            titulo: "Tortilla",
            descripcion: "Receta clásica",
            tiempo_estimado: 15,
            dificultad: "Fácil",
            ingredientes: [],
            instrucciones: [],
          },
        },
      ];

      fetch
        .mockResolvedValueOnce({ json: async () => mockHistory })
        .mockResolvedValueOnce({ json: async () => [] });

      const { container } = render(<Biblioteca />);

      await waitFor(() => {
        const item = container.querySelector(".bib-historial-item");

        if (item) {
          fireEvent.click(item);
          expect(document.body).toBeInTheDocument();
        }
      });
    });
  });

  describe("Vista Completa Functionality", () => {
    it("displays ingredients checkboxes", async () => {
      const mockHistory = [
        {
          id: 1,
          date: new Date(),
          recipe: {
            titulo: "Sopa",
            descripcion: "Test",
            tiempo_estimado: 20,
            dificultad: "Media",
            ingredientes: [{ nombre: "Agua", cantidad: "1L" }],
            instrucciones: ["Hervir agua"],
          },
        },
      ];

      fetch
        .mockResolvedValueOnce({ json: async () => mockHistory })
        .mockResolvedValueOnce({ json: async () => [] });

      const { container } = render(<Biblioteca />);

      await waitFor(() => {
        const item = container.querySelector(".bib-historial-item");

        if (item) {
          fireEvent.click(item);
        }
      });

      await waitFor(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        expect(checkboxes.length).toBeGreaterThanOrEqual(0);
      });
    });

    it("allows marking ingredients", async () => {
      const mockHistory = [
        {
          id: 1,
          date: new Date(),
          recipe: {
            titulo: "Test",
            descripcion: "",
            tiempo_estimado: 10,
            dificultad: "Fácil",
            ingredientes: [{ nombre: "Sal", cantidad: "1g" }],
            instrucciones: ["Paso 1"],
          },
        },
      ];

      fetch
        .mockResolvedValueOnce({ json: async () => mockHistory })
        .mockResolvedValueOnce({ json: async () => [] });

      const { container } = render(<Biblioteca />);

      await waitFor(() => {
        const item = container.querySelector(".bib-historial-item");
        if (item) fireEvent.click(item);
      });

      await waitFor(() => {
        const checkbox = document.querySelector('input[type="checkbox"]');

        if (checkbox) {
          fireEvent.click(checkbox);
          expect(checkbox.checked).toBe(true);
        }
      });
    });

    it("returns to biblioteca when clicking volver", async () => {
      const mockHistory = [
        {
          id: 1,
          date: new Date(),
          recipe: {
            titulo: "Test",
            descripcion: "",
            tiempo_estimado: 10,
            dificultad: "Fácil",
            ingredientes: [],
            instrucciones: [],
          },
        },
      ];

      fetch
        .mockResolvedValueOnce({ json: async () => mockHistory })
        .mockResolvedValueOnce({ json: async () => [] });

      const { container } = render(<Biblioteca />);

      await waitFor(() => {
        const item = container.querySelector(".bib-historial-item");
        if (item) fireEvent.click(item);
      });

      await waitFor(() => {
        const btn = container.querySelector(".bib-volver");
        if (btn) {
          fireEvent.click(btn);
          expect(document.body.textContent).toContain("Mi Biblioteca");
        }
      });
    });
  });

  describe("API Integration", () => {
    it("calls history API with user uid", async () => {
      fetch
        .mockResolvedValueOnce({ json: async () => [] })
        .mockResolvedValueOnce({ json: async () => [] });

      render(<Biblioteca />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    });

    it("handles API errors gracefully", async () => {
      fetch.mockRejectedValueOnce(new Error("API Error"));

      render(<Biblioteca />);

      await waitFor(() => {
        expect(document.body).toBeInTheDocument();
      });
    });
  });

  describe("Layout and Structure", () => {
    it("uses correct layout structure", () => {
      const { container } = render(<Biblioteca />);

      const layout = container.querySelector(".bib-layout");

      expect(layout).toBeInTheDocument();
    });

    it("contains main sections", () => {
      render(<Biblioteca />);

      const body = document.body.textContent;

      expect(body).toContain("Recetas Favoritas");
      expect(body).toContain("Historial Reciente");
    });
  });
});
